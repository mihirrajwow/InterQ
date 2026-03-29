import User from "../models/user.model.js"
import Interview from "../models/interview.model.js"

// GET /api/admin/stats — platform overview
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" })
    const totalAdmins = await User.countDocuments({ role: "admin" })
    const totalInterviews = await Interview.countDocuments()
    const completedInterviews = await Interview.countDocuments({ status: "completed" })

    const avgScoreResult = await Interview.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avg: { $avg: "$finalScore" } } }
    ])
    const avgScore = avgScoreResult[0]?.avg?.toFixed(1) || 0

    // Interviews per day (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyActivity = await Interview.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Mode breakdown
    const modeBreakdown = await Interview.aggregate([
      { $group: { _id: "$mode", count: { $sum: 1 } } }
    ])

    return res.json({
      totalUsers,
      totalAdmins,
      totalInterviews,
      completedInterviews,
      avgScore,
      dailyActivity,
      modeBreakdown
    })
  } catch (error) {
    return res.status(500).json({ message: `Stats error: ${error}` })
  }
}

// GET /api/admin/users — all users with interview count
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ""

    const query = search
      ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
      : {}

    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    // Attach interview count per user
    const usersWithCount = await Promise.all(
      users.map(async (u) => {
        const interviewCount = await Interview.countDocuments({ userId: u._id })
        const completed = await Interview.countDocuments({ userId: u._id, status: "completed" })
        return { ...u.toObject(), interviewCount, completedCount: completed }
      })
    )

    return res.json({ users: usersWithCount, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    return res.status(500).json({ message: `Get users error: ${error}` })
  }
}

// GET /api/admin/users/:id/interviews — a specific user's interviews
export const getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt")
    return res.json(interviews)
  } catch (error) {
    return res.status(500).json({ message: `Get user interviews error: ${error}` })
  }
}

// GET /api/admin/interviews — all interviews across platform
export const getAllInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    const total = await Interview.countDocuments()
    const interviews = await Interview.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId role experience mode finalScore status createdAt")

    return res.json({ interviews, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    return res.status(500).json({ message: `Get interviews error: ${error}` })
  }
}

// PATCH /api/admin/users/:id/role — promote/demote user
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" })
    }

    // Prevent self-demotion
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-__v")

    if (!user) return res.status(404).json({ message: "User not found" })

    return res.json({ message: `User role updated to ${role}`, user })
  } catch (error) {
    return res.status(500).json({ message: `Update role error: ${error}` })
  }
}

// DELETE /api/admin/users/:id — delete a user and their interviews
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ message: "You cannot delete yourself" })
    }
    await Interview.deleteMany({ userId: req.params.id })
    await User.findByIdAndDelete(req.params.id)
    return res.json({ message: "User and their interviews deleted" })
  } catch (error) {
    return res.status(500).json({ message: `Delete user error: ${error}` })
  }
}

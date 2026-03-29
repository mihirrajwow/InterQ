import User from "../models/user.model.js"

// Auto-creates a single default user if not exists
// No login needed — everyone shares this user
const autoUser = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: "default@interviewiq.com" })

    if (!user) {
      user = await User.create({
        name: "InterviewIQ User",
        email: "default@interviewiq.com",
        credits: 999999
      })
    }

    req.userId = user._id
    next()
  } catch (error) {
    return res.status(500).json({ message: "Auto user error: " + error })
  }
}

export default autoUser
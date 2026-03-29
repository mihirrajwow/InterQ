import User from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-__v")
    if (!user) return res.status(404).json({ message: "User not found." })
    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: `Failed to get current user: ${error}` })
  }
}

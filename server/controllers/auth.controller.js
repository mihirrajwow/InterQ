import { genToken } from "../config/token.js"
import User from "../models/user.model.js"

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" })
    }

    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ name, email })
    }

    const token = genToken(user._id)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: `Google auth error: ${error}` })
  }
}

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    return res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    return res.status(500).json({ message: `Logout error: ${error}` })
  }
}

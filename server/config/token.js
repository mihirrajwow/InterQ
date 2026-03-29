import jwt from "jsonwebtoken"

export const genToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

export const isAuth = (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Not logged in" })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "Not logged in" })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id

    // Dynamically import to avoid circular deps
    const { default: User } = await import("../models/user.model.js")
    const user = await User.findById(req.userId)
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export default genToken

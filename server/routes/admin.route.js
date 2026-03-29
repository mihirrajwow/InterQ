import express from "express"
import { isAdmin } from "../config/token.js"
import {
  getStats,
  getAllUsers,
  getUserInterviews,
  getAllInterviews,
  updateUserRole,
  deleteUser
} from "../controllers/admin.controller.js"

const adminRouter = express.Router()

// All routes protected by isAdmin
adminRouter.get("/stats", isAdmin, getStats)
adminRouter.get("/users", isAdmin, getAllUsers)
adminRouter.get("/users/:id/interviews", isAdmin, getUserInterviews)
adminRouter.get("/interviews", isAdmin, getAllInterviews)
adminRouter.patch("/users/:id/role", isAdmin, updateUserRole)
adminRouter.delete("/users/:id", isAdmin, deleteUser)

export default adminRouter

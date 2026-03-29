import express from "express"
import { isAuth } from "../config/token.js"
import { getCurrentUser } from "../controllers/user.controller.js"

const userRouter = express.Router()

userRouter.get("/current-user", isAuth, getCurrentUser)

export default userRouter

import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import authRouter from "./routes/auth.route.js"
import adminRouter from "./routes/admin.route.js"

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/admin", adminRouter)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`InterQ server running on port ${PORT}`)
  connectDb()
})

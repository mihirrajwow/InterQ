/**
 * Run this once to make your account an admin:
 *   node scripts/makeAdmin.js your@email.com
 */
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
import User from "../models/user.model.js"

const email = process.argv[2]
if (!email) {
  console.error("Usage: node scripts/makeAdmin.js your@email.com")
  process.exit(1)
}

await mongoose.connect(process.env.MONGODB_URI)
const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true })
if (!user) {
  console.error("User not found. Make sure they have logged in at least once.")
} else {
  console.log(`✅ ${user.name} (${user.email}) is now an admin.`)
}
await mongoose.disconnect()

import multer from "multer"
import path from "path"
import os from "os"

// Use OS temp dir — works on Vercel serverless (no writable "public" dir)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir())
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.originalname
    cb(null, filename)
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

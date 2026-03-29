import React, { useState } from 'react'
import { motion } from "motion/react"
import { BsRobot } from "react-icons/bs"
import { HiSparkles } from "react-icons/hi"
import { auth, provider } from '../utils/firebase'
import { signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'
import { ServerUrl } from '../App'

function AuthPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleLogin = async () => {
    if (loading) return
    setLoading(true)
    setError("")
    try {
      const result = await signInWithPopup(auth, provider)
      const { displayName: name, email } = result.user

      const res = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true })
      dispatch(setUserData(res.data))
      navigate("/")
    } catch (err) {
      console.error(err)
      setError("Sign-in failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center px-4'>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='flex items-center gap-3 mb-10 cursor-pointer'
        onClick={() => navigate("/")}
      >
        <div className='bg-black text-white p-2 rounded-lg'>
          <BsRobot size={20} />
        </div>
        <h1 className='font-semibold text-xl'>InterQ</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='bg-white rounded-3xl shadow-md border border-gray-200 p-10 w-full max-w-md text-center'
      >
        <div className='flex justify-center mb-5'>
          <div className='bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2'>
            <HiSparkles size={16} className="text-green-600" />
            AI Powered Smart Interview Platform
          </div>
        </div>

        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Welcome to InterQ</h2>
        <p className='text-gray-500 text-sm mb-8'>Sign in to start your AI-powered mock interviews</p>

        {error && (
          <p className='text-red-500 text-sm mb-4'>{error}</p>
        )}

        <motion.button
          onClick={handleGoogleLogin}
          disabled={loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className='w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full shadow-sm hover:bg-gray-50 transition font-medium disabled:opacity-60'
        >
          {/* Google SVG icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </motion.button>

        <p className='text-gray-400 text-xs mt-6'>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}

export default AuthPage

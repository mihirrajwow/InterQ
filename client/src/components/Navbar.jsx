import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsCoin } from "react-icons/bs"
import { useNavigate } from 'react-router-dom'
import { setUserData } from '../redux/userSlice'
import axios from 'axios'
import { ServerUrl } from '../App'
import { auth } from '../utils/firebase'
import { signOut } from 'firebase/auth'

function Navbar() {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [showUserPopup, setShowUserPopup] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
      await signOut(auth)
      dispatch(setUserData(null))
      navigate("/auth")
    } catch (err) {
      console.error(err)
    }
    setShowUserPopup(false)
  }

  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative'>

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className='flex items-center gap-3 cursor-pointer'>
          <div className='bg-black text-white p-2 rounded-lg'>
            <BsRobot size={18} />
          </div>
          <h1 className='font-semibold hidden md:block text-lg'>InterQ</h1>
        </div>

        {/* Right side */}
        <div className='flex items-center gap-6 relative'>

          {userData ? (
            <>
              {/* Credits */}
              <div className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md'>
                <BsCoin size={20} />
                <span>{userData?.credits ?? "..."}</span>
              </div>

              {/* User icon */}
              <div className='relative'>
                <button
                  onClick={() => setShowUserPopup(!showUserPopup)}
                  className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm'>
                  {userData?.name?.slice(0, 1).toUpperCase() ?? "U"}
                </button>

                {showUserPopup && (
                  <div className='absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50'>
                    <p className='text-sm text-blue-500 font-medium mb-2'>
                      {userData?.name ?? "User"}
                    </p>
                    <button
                      onClick={() => { navigate("/history"); setShowUserPopup(false) }}
                      className='w-full text-left text-sm py-2 hover:text-black text-gray-600'>
                      Interview History
                    </button>
                    <button
                      onClick={handleLogout}
                      className='w-full text-left text-sm py-2 hover:text-red-500 text-gray-600'>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <motion.button
              onClick={() => navigate("/auth")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className='bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition'>
              Sign In
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Navbar

import React, { useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import InterviewReport from './pages/InterviewReport'
import AuthPage from './pages/AuthPage'
import AdminPanel from './pages/AdminPanel'

export const ServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:6000"

function ProtectedRoute({ children }) {
  const { userData, loading } = useSelector((state) => state.user)
  if (loading) return null
  if (!userData) return <Navigate to="/auth" replace />
  return children
}

function AdminRoute({ children }) {
  const { userData, loading } = useSelector((state) => state.user)
  if (loading) return null
  if (!userData) return <Navigate to="/auth" replace />
  if (userData.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function App() {
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        dispatch(setUserData(result.data))
      } catch (error) {
        dispatch(setUserData(null))
      }
    }
    getUser()
  }, [dispatch])

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={userData ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path='/interview' element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
      <Route path='/history' element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
      <Route path='/report/:id' element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
      <Route path='/admin' element={<AdminRoute><AdminPanel /></AdminRoute>} />
    </Routes>
  )
}

export default App

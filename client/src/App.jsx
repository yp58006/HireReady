import React, { useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import InterviewReport from './pages/InterviewReport.jsx'
import Pricing from './pages/pricing.jsx'
import Myorders from './pages/Myorders.jsx'
import { setSessionLoading, setUserdata } from './redux/slices/userSlice.js'

export const serverurl = "https://hireready-dbzk.onrender.com";

function ProtectedRoute({ children }) {
  const { userData, isSessionLoading } = useSelector((state) => state.user)
  const location = useLocation()

  // Wait for the cookie-backed session check so authenticated users are not
  // redirected to login during the initial app load.
  if (isSessionLoading) {
    return <div aria-live="polite">Checking your session...</div>
  }

  if (!userData) {
    return <Navigate to="/Auth" replace state={{ from: location }} />
  }

  return children
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        const response = await axios.get(`${serverurl}/api/user/currentuser`, { withCredentials: true })
        dispatch(setUserdata(response.data || null))
      } catch (error) {
        dispatch(setUserdata(null))
      } finally {
        dispatch(setSessionLoading(false))
      }
    }

    restoreUserSession()
  }, [dispatch])

  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Auth' element={<Auth/>}/>
      <Route path='/setup' element={<ProtectedRoute><InterviewPage/></ProtectedRoute>}/>
      <Route path='/interviews' element={<ProtectedRoute><InterviewHistory/></ProtectedRoute>}/>
      <Route path='/history' element={<ProtectedRoute><InterviewHistory/></ProtectedRoute>}/>
      <Route path='/report/:id' element={<ProtectedRoute><InterviewReport/></ProtectedRoute>}/>
      <Route path='/pricing' element={<ProtectedRoute><Pricing/></ProtectedRoute>}/>
      <Route path='/myorders' element={<ProtectedRoute><Myorders/></ProtectedRoute>}/>
    </Routes>
  )
}

export default App

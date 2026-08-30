import React, { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import InterviewReport from './pages/InterviewReport.jsx'
import Pricing from './pages/pricing.jsx'
import Myorders from './pages/Myorders.jsx'
import { setUserdata } from './redux/slices/userSlice.js'

export const serverurl = "http://localhost:8000";

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        const response = await axios.get(`${serverurl}/api/user/currentuser`, { withCredentials: true })
        dispatch(setUserdata(response.data || null))
      } catch (error) {
        dispatch(setUserdata(null))
      }
    }

    restoreUserSession()
  }, [dispatch])

  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Auth' element={<Auth/>}/>
      <Route path='/setup' element={<InterviewPage/>}/>
      <Route path='/interviews' element={<InterviewHistory/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/myorders' element={<Myorders/>}/>
    </Routes>
  )
}

export default App
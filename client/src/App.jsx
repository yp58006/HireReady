import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import InterviewReport from './pages/interviewReport.jsx'

export const serverurl = "http://localhost:8000";
function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/Auth' element={<Auth/>}/>
      <Route path='/setup' element={<InterviewPage/>}/>
      <Route path='/interviews' element={<InterviewHistory/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>
    </Routes>
  )
}

export default App
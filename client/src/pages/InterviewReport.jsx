import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { serverurl } from '../App.jsx'
import Report from '../components/Report.jsx'

function InterviewReport() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReport = async () => {
      try {
        const response = await axios.get(`${serverurl}/api/interview/report/${id}`, { withCredentials: true })
        setReport(response.data)
      } catch (requestError) {
        console.error('Failed to load interview report:', requestError)
        setError('This interview report could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadReport()
  }, [id])

  if (loading) return <main className="report-page"><div className="report-panel empty-report"><h1>Loading report...</h1></div></main>
  if (error) return <main className="report-page"><div className="report-panel empty-report"><h1>{error}</h1></div></main>
  return <Report report={report} />
}

export default InterviewReport
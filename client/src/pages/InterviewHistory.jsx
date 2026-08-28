import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { serverurl } from '../App.jsx'

// Yash
function InterviewHistory() {
  const [interviewHistory, setInterviewHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const interviewsPerPage = 5
  const navigate = useNavigate()

  useEffect(() => {
    const getInterviewHistory = async () => {
      try {
        const response = await axios.get(
          `${serverurl}/api/interview/get-interview`,
          { withCredentials: true }
        )

        setInterviewHistory(
          Array.isArray(response.data)
            ? response.data
            : response.data.interviews || []
        )
      } catch (error) {
        console.error('Failed to fetch interview history:', error)
      } finally {
        setLoading(false)
      }
    }

    getInterviewHistory()
  }, [])

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : 'N/A'

  const totalPages = Math.ceil(interviewHistory.length / interviewsPerPage)

  const openReport = (interview) => {
    const id = interview._id || interview.id
    if (id) navigate(`/report/${id}`)
  }

  const startIndex = (currentPage - 1) * interviewsPerPage
  const currentInterviews = interviewHistory.slice(
    startIndex,
    startIndex + interviewsPerPage
  )

  if (loading) return <p className="p-6">Loading interview history...</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-6 text-3xl font-bold">Interview History</h1>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Role</th>
              <th className="p-4">Experience</th>
              <th className="p-4">Mode</th>
              <th className="p-4">Date</th>
              <th className="p-4">Final Score</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {currentInterviews.map((interview) => {
              const id = interview._id || interview.id

              return (
                <tr
                  key={id}
                  onClick={() => openReport(interview)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') openReport(interview)
                  }}
                  tabIndex={id ? 0 : -1}
                  className="cursor-pointer border-t hover:bg-blue-50"
                >
                  <td className="p-4">{interview.role || 'N/A'}</td>
                  <td className="p-4">{interview.experience || 'N/A'}</td>
                  <td className="p-4">{interview.mode || 'N/A'}</td>
                  <td className="p-4">
                    {formatDate(interview.createdAt || interview.date)}
                  </td>
                  <td className="p-4">
                    {interview.finalScore ?? interview.finalscore ?? 'N/A'}
                  </td>
                  <td className="p-4">{interview.status || 'Completed'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default InterviewHistory
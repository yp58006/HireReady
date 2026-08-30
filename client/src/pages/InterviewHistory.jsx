import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { serverurl } from '../App.jsx'

const formatRoleTitle = (value) => {
  if (!value) return 'Interview'

  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function InterviewHistory() {
  const [interviewHistory, setInterviewHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5
  const navigate = useNavigate()

  useEffect(() => {
    const getInterviewHistory = async () => {
      try {
        const response = await axios.get(
          `${serverurl}/api/interview/get-interview`,
          { withCredentials: true }
        )

        const records = Array.isArray(response.data)
          ? response.data
          : response.data?.interviews || []

        setInterviewHistory(records)
      } catch (error) {
        console.error('Failed to fetch interview history:', error)
        setInterviewHistory([])
      } finally {
        setLoading(false)
      }
    }

    getInterviewHistory()
  }, [])

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) : 'N/A'

  const getScoreTone = (score) => {
    const value = Number(score) || 0
    if (value >= 8) return 'good'
    if (value >= 6) return 'average'
    return 'low'
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter])

  const filteredInterviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return interviewHistory.filter((interview) => {
      const role = String(interview.role || '').toLowerCase()
      const mode = String(interview.mode || '').toLowerCase()
      const status = String(interview.status || '').toLowerCase()

      const matchesSearch =
        !normalizedSearch || role.includes(normalizedSearch) || mode.includes(normalizedSearch)

      const matchesType = typeFilter === 'all' || String(interview.mode || '').toLowerCase() === typeFilter
      const matchesStatus = statusFilter === 'all' || status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [interviewHistory, searchTerm, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / pageSize))
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const openReport = (interview) => {
    const id = interview._id || interview.id
    if (id && String(interview.status || '').toLowerCase() === 'completed') {
      navigate(`/report/${id}`)
    }
  }

  if (loading) {
    return (
      <main className="history-page">
        <div className="history-shell">
          <div className="history-loading">
            <div className="spinner" aria-label="Loading interview history" />
            <span>Loading interview history...</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="history-page">
      <style>{`
        :root {
          --history-bg: #f4f8fc;
          --history-surface: #ffffff;
          --history-surface-soft: #f8fbff;
          --history-border: #dfeaf5;
          --history-text: #15273b;
          --history-text-soft: #5f7189;
          --history-accent: #2563eb;
          --history-accent-soft: #edf4ff;
          --history-success: #0f9f7d;
          --history-success-soft: #ebfbf7;
          --history-warning: #d97706;
          --history-warning-soft: #fff7ed;
          --history-danger: #ef4444;
          --history-danger-soft: #fff1f2;
          --history-shadow: 0 16px 30px rgba(15, 23, 42, 0.04);
        }

        * { box-sizing: border-box; }

        .history-page {
          min-height: calc(100vh - 72px);
          padding: 28px clamp(16px, 4vw, 72px) 56px;
          background: linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0)), var(--history-bg);
          color: var(--history-text);
          font-family: Inter, "Segoe UI", sans-serif;
        }

        .history-shell {
          max-width: 1200px;
          margin: 0 auto;
        }

        .history-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }

        .history-eyebrow {
          margin: 0 0 8px;
          color: var(--history-accent);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .history-header h1 {
          margin: 0;
          font-size: clamp(1.8rem, 2.6vw, 2.5rem);
          letter-spacing: -0.05em;
          line-height: 1.1;
          font-weight: 700;
        }

        .history-subtitle {
          margin: 8px 0 0;
          color: var(--history-text-soft);
          font-size: 0.95rem;
        }

        .summary-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--history-accent-soft);
          color: var(--history-accent);
          border: 1px solid rgba(37, 99, 235, 0.12);
          font-size: 0.76rem;
          font-weight: 700;
        }

        .history-control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 18px;
          margin-bottom: 18px;
          background: rgba(255,255,255,0.9);
          border: 1px solid var(--history-border);
          border-radius: 18px;
          box-shadow: var(--history-shadow);
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 46px;
          padding: 0 14px;
          border: 1px solid var(--history-border);
          border-radius: 12px;
          background: var(--history-surface-soft);
        }

        .search-box svg {
          width: 16px;
          height: 16px;
          color: var(--history-text-soft);
          flex-shrink: 0;
        }

        .search-box input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          color: var(--history-text);
          font: inherit;
        }

        .search-box input::placeholder {
          color: var(--history-text-soft);
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .history-select {
          min-width: 150px;
          height: 42px;
          padding: 0 12px;
          border: 1px solid var(--history-border);
          border-radius: 12px;
          background: #fff;
          color: var(--history-text);
          font: inherit;
        }

        .history-list {
          display: grid;
          gap: 14px;
        }

        .history-card {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) repeat(5, minmax(90px, 1fr));
          gap: 14px;
          align-items: center;
          padding: 18px 20px;
          background: rgba(255,255,255,0.92);
          border: 1px solid var(--history-border);
          border-radius: 18px;
          box-shadow: var(--history-shadow);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }

        .history-card:hover {
          transform: translateY(-1px);
          border-color: rgba(37, 99, 235, 0.18);
          box-shadow: 0 18px 30px rgba(15, 23, 42, 0.05);
        }

        .history-card.incomplete {
          background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,250,255,0.96));
        }

        .cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .cell-label {
          color: var(--history-text-soft);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .role-name {
          margin: 0;
          color: var(--history-text);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .meta-value {
          color: var(--history-text);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          min-height: 30px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-badge.completed {
          color: var(--history-success);
          background: var(--history-success-soft);
        }

        .status-badge.incomplete {
          color: var(--history-warning);
          background: var(--history-warning-soft);
        }

        .score-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          min-height: 30px;
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 800;
          border: 1px solid transparent;
        }

        .score-badge.good {
          color: var(--history-success);
          background: var(--history-success-soft);
          border-color: rgba(15, 159, 125, 0.12);
        }

        .score-badge.average {
          color: var(--history-warning);
          background: var(--history-warning-soft);
          border-color: rgba(217, 119, 6, 0.12);
        }

        .score-badge.low {
          color: var(--history-danger);
          background: var(--history-danger-soft);
          border-color: rgba(239, 68, 68, 0.12);
        }

        .history-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          grid-column: 1 / -1;
        }

        .history-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(37, 99, 235, 0.16);
          border-radius: 10px;
          background: var(--history-accent-soft);
          color: var(--history-accent);
          cursor: pointer;
          padding: 8px 12px;
          font: inherit;
          font-size: 0.78rem;
          font-weight: 700;
          transition: background 0.18s ease, transform 0.18s ease;
          min-width: 110px;
        }

        .history-button:hover {
          background: rgba(37, 99, 235, 0.08);
        }

        .history-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 22px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.9);
          border: 1px solid var(--history-border);
          border-radius: 16px;
          box-shadow: var(--history-shadow);
          color: var(--history-text-soft);
          font-size: 0.84rem;
          font-weight: 600;
        }

        .page-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 90px;
          height: 38px;
          padding: 0 12px;
          border: 1px solid rgba(37, 99, 235, 0.14);
          border-radius: 10px;
          background: var(--history-accent-soft);
          color: var(--history-accent);
          cursor: pointer;
          font: inherit;
          font-weight: 700;
        }

        .page-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .history-empty {
          padding: 28px;
          text-align: center;
          border: 1px solid var(--history-border);
          border-radius: 18px;
          background: rgba(255,255,255,0.9);
          color: var(--history-text-soft);
        }

        .history-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 220px;
          border: 1px solid var(--history-border);
          border-radius: 18px;
          background: rgba(255,255,255,0.9);
          color: var(--history-text-soft);
          font-weight: 600;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(37, 99, 235, 0.15);
          border-top-color: var(--history-accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 980px) {
          .history-card {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .history-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .history-control-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box,
          .filter-row {
            width: 100%;
          }

          .filter-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .history-select {
            width: 100%;
            min-width: 0;
          }

          .history-card {
            grid-template-columns: 1fr;
            padding: 16px;
          }

          .history-actions {
            justify-content: flex-start;
          }
        }
      `}</style>

      <div className="history-shell">
        <header className="history-header">
          <div>
            <p className="history-eyebrow">Overview</p>
            <h1>Interview History</h1>
            <p className="history-subtitle">Track your progress, compare recent rounds, and revisit your best interviews.</p>
          </div>

          <span className="summary-pill">{filteredInterviews.length} records</span>
        </header>

        <div className="history-control-bar">
          <label className="search-box" aria-label="Search interviews">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21L16.65 16.65" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search role or type"
            />
          </label>

          <div className="filter-row">
            <select className="history-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">All types</option>
              <option value="technical">Technical</option>
              <option value="hr">HR</option>
              <option value="managerial">Managerial</option>
            </select>

            <select className="history-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
        </div>

        <div className="history-list">
          {paginatedInterviews.length ? (
            paginatedInterviews.map((interview) => {
              const id = interview._id || interview.id
              const isCompleted = String(interview.status || '').toLowerCase() === 'completed'
              const score = Number(interview.finalScore ?? 0)
              const scoreTone = getScoreTone(score)

              const roleLabel = formatRoleTitle(interview.role || 'N/A')

              return (
                <article key={id || `${interview.role}-${interview.createdAt}`} className={`history-card ${isCompleted ? '' : 'incomplete'}`}>
                  <div className="cell">
                    <span className="cell-label">Role</span>
                    <p className="role-name">{roleLabel}</p>
                  </div>

                  <div className="cell">
                    <span className="cell-label">Experience</span>
                    <span className="meta-value">{interview.experience || 'N/A'}</span>
                  </div>

                  <div className="cell">
                    <span className="cell-label">Interview Type</span>
                    <span className="meta-value">{String(interview.mode || 'N/A').charAt(0).toUpperCase() + String(interview.mode || 'N/A').slice(1)}</span>
                  </div>

                  <div className="cell">
                    <span className="cell-label">Date</span>
                    <span className="meta-value">{formatDate(interview.createdAt || interview.date)}</span>
                  </div>

                  <div className="cell">
                    <span className="cell-label">Final Score</span>
                    <span className={`score-badge ${scoreTone}`}>{score ? `${score.toFixed(1)}/10` : 'N/A'}</span>
                  </div>

                  <div className="cell">
                    <span className="cell-label">Status</span>
                    <span className={`status-badge ${String(interview.status || 'completed').toLowerCase()}`}>
                      {interview.status || 'Completed'}
                    </span>
                  </div>

                  <div className="history-actions">
                    {isCompleted && (
                      <button type="button" className="history-button" onClick={() => openReport(interview)}>
                        View report
                      </button>
                    )}
                  </div>
                </article>
              )
            })
          ) : (
            <div className="history-empty">
              <h3>No Interviews Yet</h3>
              <p>Your interview history will appear here once you start and complete a round.</p>
            </div>
          )}
        </div>

        {filteredInterviews.length > 0 && (
          <div className="history-pagination">
            <button
              type="button"
              className="page-button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="page-button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default InterviewHistory
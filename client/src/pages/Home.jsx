import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FiArrowRight, FiCheckCircle, FiClock, FiLogOut, FiMenu, FiTrendingUp, FiX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { serverurl } from '../App.jsx'
import { setUserdata } from '../redux/slices/userSlice.js'
import './home.css'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Interviews', to: '/interviews' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'My Orders', to: '/myorders' },
]

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

function Home() {
  const userData = useSelector((state) => state.user.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [recentInterviews, setRecentInterviews] = useState([])
  const [loadingInterviews, setLoadingInterviews] = useState(true)
  const [showCreditsTooltip, setShowCreditsTooltip] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const profileImage = userData?.image || userData?.photo || userData?.avatar || userData?.profileImage
  const name = userData?.name?.split(' ')[0] || ''
  const initials = (userData?.name || 'User').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  const greeting = 'GoodMorning'

  useEffect(() => {
    const fetchRecentInterviews = async () => {
      try {
        const response = await axios.get(`${serverurl}/api/interview/get-interview`, { withCredentials: true })
        const interviews = Array.isArray(response.data) ? response.data : response.data?.interviews || []
        setRecentInterviews(interviews.slice(0, 3))
      } catch (error) {
        console.error('Failed to fetch recent interviews:', error)
      } finally {
        setLoadingInterviews(false)
      }
    }

    fetchRecentInterviews()
  }, [])

  useEffect(() => {
    setAvatarFailed(false)
  }, [profileImage])

  const totalInterviews = recentInterviews.length
  const averageScore = useMemo(() => {
    if (!recentInterviews.length) return 0
    const validScores = recentInterviews
      .map((entry) => Number(entry.finalScore ?? entry.finalscore ?? 0))
      .filter((score) => !Number.isNaN(score))
    if (!validScores.length) return 0
    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
  }, [recentInterviews])

  const progressStatus = totalInterviews ? (averageScore >= 75 ? 'On track' : 'Building rhythm') : 'Ready'
  const strongestArea = totalInterviews ? 'Communication' : 'Communication'
  const focusNext = totalInterviews ? 'Technical depth' : 'Technical depth'
  const practiceStreak = totalInterviews ? Math.min(totalInterviews, 3) : 0

  const logout = async () => {
    try {
      await axios.get(`${serverurl}/api/auth/logout`, { withCredentials: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
    dispatch(setUserdata(null))
    navigate('/Auth')
  }

  return (
    <div className="editorial-home">
      <header className="eh-header">
        <Link className="eh-brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="eh-brand-mark">
            <img src="/Images/PlatformImage.png" alt="HireReady logo" />
          </span>
          <span>HireReady</span>
        </Link>

        <nav className={`eh-nav ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className={link.label === 'Home' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="eh-header-actions">
          {userData && (
            <div
              className="credit-wrapper"
              onMouseEnter={() => setShowCreditsTooltip(true)}
              onMouseLeave={() => setShowCreditsTooltip(false)}
              onFocus={() => setShowCreditsTooltip(true)}
              onBlur={() => setShowCreditsTooltip(false)}
            >
              <span className="credit-pill">
                <img className="credit-coin" src="/Images/CoinsImage.png" alt="credits" />
                {userData.credits ?? 0} credits
              </span>
              <div
                className={`credit-tooltip ${showCreditsTooltip ? 'visible' : ''}`}
                onMouseEnter={() => setShowCreditsTooltip(true)}
                onMouseLeave={() => setShowCreditsTooltip(false)}
              >
                <span>Need more credits?</span>
                <Link to="/pricing">View plans</Link>
              </div>
            </div>
          )}

          <div className="eh-avatar">
            {profileImage && !avatarFailed ? (
              <img
                src={profileImage}
                alt={userData?.name || 'User'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              initials
            )}
          </div>

          {userData ? (
            <button className="eh-logout" type="button" onClick={logout} title="Log out">
              <FiLogOut />
            </button>
          ) : (
            <Link className="eh-signin" to="/Auth">Sign in</Link>
          )}

          <button className="eh-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      <main className="eh-main">
        <section className="eh-welcome">
          <div className="eh-welcome-copy">
            <p className="eh-label">Welcome back</p>
            <h1>{userData ? `${greeting}, ${name}.` : `${greeting},`}</h1>
            <h2>Ready for your next interview?</h2>
            <p className="eh-subtext">Take a breath, practice with intention, and keep building momentum one conversation at a time.</p>

            <div className="eh-actions">
              <Link className="eh-primary" to="/setup">Start an interview <FiArrowRight /></Link>
              <Link className="eh-secondary" to="/setup">Set it up first</Link>
            </div>
          </div>

          <div className="eh-visual" aria-hidden="true">
            <div className="visual-ring" />
            <div className="visual-panel">
              <div className="visual-head">
                <span />
                <span />
                <span />
              </div>

              <div className="conversation-block">
                <div className="conversation-row">
                  <span className="dot" />
                  <span className="line short" />
                  <span className="line medium" />
                </div>
                <div className="conversation-row answer-row">
                  <span className="line medium" />
                  <span className="line long" />
                  <span className="dot dot-alt" />
                </div>
                <div className="conversation-row">
                  <span className="dot" />
                  <span className="line short" />
                  <span className="line medium" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="eh-progress">
          <div className="eh-section-heading">
            <div>
              <p className="eh-label">Preparation</p>
              <h3>Your progress</h3>
            </div>
            <Link to="/interviews">View all</Link>
          </div>

          {!loadingInterviews && !recentInterviews.length ? (
            <div className="eh-empty-state">
              <p>No interviews to look back on yet.</p>
              <span>Your first conversation is a good place to begin. The work starts with one honest round.</span>
            </div>
          ) : (
            <div className="eh-metrics">
              <div className="eh-metric metric-interviews">
                <div className="metric-icon-wrap">
                  <span className="metric-icon ring-icon">{totalInterviews}</span>
                </div>
                <div>
                  <span className="metric-label">Interviews completed</span>
                  <strong>{totalInterviews}</strong>
                </div>
              </div>

              <div className="eh-metric metric-score">
                <div className="metric-icon-wrap">
                  <span className="metric-icon score-icon">{averageScore}</span>
                </div>
                <div>
                  <span className="metric-label">Average score</span>
                  <strong>{averageScore}%</strong>
                </div>
              </div>

              <div className="eh-metric metric-status">
                <div className="metric-icon-wrap">
                  <span className="metric-status-dot" />
                </div>
                <div>
                  <span className="metric-label">Current status</span>
                  <strong>{progressStatus}</strong>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="eh-history">
          <div className="eh-section-heading small-gap">
            <div>
              <p className="eh-label">Recent work</p>
              <h3>Recent interviews</h3>
            </div>
            <Link to="/interviews">View full interview history</Link>
          </div>

          {!loadingInterviews && !recentInterviews.length ? (
            <div className="eh-empty-state list-empty">
              <p>No interviews yet.</p>
              <span>Your preparation begins with one honest conversation.</span>
            </div>
          ) : (
            <div className="eh-history-list">
              {recentInterviews.map((interview) => {
                const rawScore = Number(interview.finalScore ?? interview.finalscore ?? 0)
                const scoreValue = Number.isNaN(rawScore) ? 0 : rawScore
                const scoreTone = scoreValue >= 80 ? 'good' : scoreValue >= 60 ? 'medium' : 'low'
                const interviewStatus = interview.status === 'incomplete' || interview.status === 'in_progress' ? 'In Progress' : 'Completed'
                const interviewMode = interview.mode || 'Technical interview'
                const createdDate = new Date(interview.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                return (
                  <div className="eh-history-item" key={interview._id || interview.id || `${interview.role}-${interview.createdAt}`}>
                    <div className="eh-history-main">
                      <div className="eh-history-role-row">
                        <h4>{formatRoleTitle(interview.role)}</h4>
                        <span className={`eh-status-badge ${interviewStatus === 'Completed' ? 'status-complete' : 'status-progress'}`}>
                          {interviewStatus}
                        </span>
                      </div>
                      <p>
                        {interviewMode} · {createdDate}
                      </p>
                    </div>

                    <div className={`eh-history-score score-${scoreTone}`}>
                      <span>{scoreValue || '—'}</span>
                      <small>{scoreValue ? '/ 100' : 'score'}</small>
                    </div>

                    <Link to={`/report/${interview._id || interview.id}`}>
                      View report <FiArrowRight />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="eh-insights">
          <div className="eh-section-heading small-gap">
            <div>
              <p className="eh-label">Coaching</p>
              <h3>Keep improving</h3>
            </div>
          </div>

          <div className="eh-insight-grid">
            <article className="eh-insight-card insight-communication">
              <div className="insight-icon">
                <FiTrendingUp />
              </div>
              <div>
                <span>Your strongest area</span>
                <strong>{strongestArea}</strong>
              </div>
            </article>

            <article className="eh-insight-card insight-focus">
              <div className="insight-icon">
                <FiClock />
              </div>
              <div>
                <span>Focus next</span>
                <strong>{focusNext}</strong>
              </div>
            </article>

            <article className="eh-insight-card insight-streak">
              <div className="insight-icon">
                <FiCheckCircle />
              </div>
              <div>
                <span>Practice streak</span>
                <strong>{practiceStreak} interviews completed</strong>
              </div>
            </article>
          </div>
        </section>

        <section className="eh-pricing-strip">
          <div className="eh-pricing-copy">
            <p className="eh-label">Practice balance</p>
            <h3>{userData?.credits ?? 0} credits available</h3>
          </div>

          <div className="eh-credit-usage">
            <div className="eh-credit-ring">
              <span>{Math.min(100, Math.max(20, (userData?.credits ?? 0) / 10))}%</span>
            </div>
            <p>Keep practicing when you're ready.</p>
          </div>

          <Link to="/pricing">Explore plans <FiArrowRight /></Link>
        </section>
      </main>
    </div>
  )
}

export default Home
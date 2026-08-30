import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { serverurl } from '../App.jsx'
import { setUserdata } from '../redux/slices/userSlice.js'
import '../components/setup.css'

export default function Setup({ onstart }) {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)

  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [type, setType] = useState('technical')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [countdown, setCountdown] = useState(5)
  const [startReady, setStartReady] = useState(false)

  useEffect(() => {
    if (!analysis) {
      setCountdown(5)
      setStartReady(false)
      return
    }

    if (countdown <= 0) {
      setStartReady(true)
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [analysis, countdown])

  const onFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null
    setFile(nextFile)
    setAnalysis(null)
    setStartReady(false)
    setCountdown(5)
  }

  const handleAnalyze = async () => {
    if (!role.trim()) {
      alert('Please enter the target role.')
      return
    }

    if (!experience.trim()) {
      alert('Please enter your years of experience.')
      return
    }

    setLoading(true)

    try {
      let resumeText = ''
      let skills = []
      let projects = []
      let experienceList = []
      let detectedRole = role.trim()

      if (file) {
        const fd = new FormData()
        fd.append('resume', file)
        fd.append('role', role)
        fd.append('experience', experience)
        fd.append('interviewType', type)

        const res = await axios.post(`${serverurl}/api/interview/resume`, fd, { withCredentials: true })
        const data = res.data || {}
        const result = data.result || {}

        skills = Array.isArray(result.skills) ? result.skills : []
        projects = Array.isArray(result.projects) ? result.projects : []
        experienceList = Array.isArray(result.experience) ? result.experience : []
        resumeText = data.text || ''
        detectedRole = result.role || role.trim()

        setAnalysis({
          text: resumeText,
          role: detectedRole,
          skills,
          projects,
          experience: experienceList,
          summary: data.summary || `Target role: ${detectedRole}.`,
        })
      } else {
        setAnalysis({
          text: '',
          role: detectedRole,
          skills: [],
          projects: [],
          experience: [],
          summary: `Target role: ${detectedRole}. Interview will be personalized using your role and experience details.`,
        })
      }

      setCountdown(5)
      setStartReady(false)
    } catch (error) {
      console.error('Resume preparation failed:', error)
      alert('Could not prepare your interview. Please try again.')
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    if (!analysis) return

    try {
      setLoading(true)

      const response = await axios.post(
        `${serverurl}/api/interview/generatequestion`,
        {
          role,
          experience,
          mode: type,
          resumetxt: analysis.text,
          projects: analysis.projects,
          skills: analysis.skills,
        },
        { withCredentials: true }
      )

      const interviewData = response.data

      dispatch(
        setUserdata({
          ...userData,
          credits: interviewData.creditsleft,
        })
      )

      onstart?.(interviewData)
    } catch (error) {
      console.error('Failed to start interview:', error)
      alert('Failed to start the interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup-shell">
      <div className="setup-header">
        <p className="section-eyebrow">Interview setup</p>
        <h1>Set up your interview</h1>
        <p className="section-copy">
          Tell us about your target role and upload your resume to personalize your interview.
        </p>
      </div>

      <div className="setup-card">
        <div className="setup-main-panel">
          <div className="panel-header">
            <h2>Interview details</h2>
          </div>

          <div className="field-group">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Backend Engineer"
            />
          </div>

          <div className="two-col-fields">
            <div className="field-group">
              <label htmlFor="experience">Experience (years)</label>
              <input
                id="experience"
                type="number"
                min="0"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                placeholder="3"
              />
            </div>

            <div className="field-group">
              <label htmlFor="interviewType">Interview Type</label>
              <select id="interviewType" value={type} onChange={(event) => setType(event.target.value)}>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="managerial">Managerial</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="resume-upload" className="upload-label">Upload Your Resume</label>
            <small className="upload-optional">(Optional)</small>

            <label className="upload-box" htmlFor="resume-upload">
              <input id="resume-upload" type="file" accept=".pdf" onChange={onFileChange} />
              <div className="upload-content">
                {file ? (
                  <>
                    <span className="upload-title selected-file">
                      <img className="pdf-icon" src="/Images/PdfIcon.png" alt="PDF" />
                      {file.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="upload-title">Upload your resume</span>
                    <span className="upload-subtitle">PDF only</span>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="analysis-box">
            <div className="analysis-copy">
              <strong>
                <img className="credit-coin" src="/Images/CoinsImage.png" alt="credits" />
                50 credits
              </strong>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={handleAnalyze}
              disabled={loading || !role.trim() || !experience.trim() || !!analysis}
            >
              {loading ? 'Preparing your interview...' : analysis ? 'Preparing your interview...' : 'Prepare Interview · 50 credits'}
            </button>
          </div>

        </div>

        <aside className="insights-panel">
          <div className="panel-header">
            <h2>Resume insights</h2>
          </div>

          {!analysis ? (
            <div className="empty-state">
              <p>Insights from your resume will appear here.</p>
              <span>Once the analysis is complete, your detected role, skills, projects, and experience will be summarized here.</span>
            </div>
          ) : (
            <div className="insight-stack">
              <div className="insight-card">
                <p className="card-label">Resume summary</p>
                <h3>{analysis.role}</h3>
                <p>{analysis.summary}</p>
              </div>

              <div className="insight-card">
                <p className="card-label">Extracted skills</p>
                <div className="skill-list">
                  {analysis.skills.length ? (
                    analysis.skills.map((skill, index) => (
                      <span key={`${skill}-${index}`} className="skill-chip">{skill}</span>
                    ))
                  ) : (
                    <span className="muted-text">No skills detected</span>
                  )}
                </div>
              </div>

              <div className="insight-card">
                <p className="card-label">Projects</p>
                {analysis.projects.length ? (
                  <ul className="bullet-list">
                    {analysis.projects.map((project, index) => (
                      <li key={`${project.name || 'project'}-${index}`}>
                        {typeof project === 'string' ? project : project.name || 'Project'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted-text">No projects detected</p>
                )}
              </div>

              <div className="insight-card">
                <p className="card-label">Experience</p>
                {analysis.experience.length ? (
                  <ul className="bullet-list">
                    {analysis.experience.map((item, index) => {
                      const company = typeof item === 'string' ? item : item.company || 'Company'
                      const duration = typeof item === 'string' ? '' : item.duration || item.experience || ''

                      return (
                        <li key={`${company}-${index}`}>
                          <strong>{company}</strong>
                          {duration ? <span> • {duration}</span> : null}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="muted-text">No experience details detected</p>
                )}
              </div>
            </div>
          )}

          {analysis && (
            <div className="right-status-block">
              {!startReady ? (
                <div className="countdown-box">
                  <p className="countdown-label">Preparing your interview</p>
                  <p className="countdown-text">Your interview is ready in {countdown} seconds</p>
                </div>
              ) : (
                <div className="ready-box">
                  <p className="ready-title">Your interview is ready</p>
                  <p className="ready-note">50 credits were charged while preparing your interview.</p>
                </div>
              )}

              {startReady && (
                <button type="button" className="start-button" onClick={handleStart} disabled={loading}>
                  {loading ? 'Preparing interview...' : 'Start Interview →'}
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

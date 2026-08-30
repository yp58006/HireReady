import React from 'react'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import './report.css'

const scoreLabel = (score) => {
  if (score >= 8) return ['Strong performance', 'You have a solid base. Keep sharpening your examples and delivery.']
  if (score >= 6) return ['Good foundation', 'A little more structure and detail will make your answers stronger.']
  return ['Room to grow', 'Use this feedback as a clear starting point for your next practice round.']
}

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

const clampScore = (value) => Math.max(0, Math.min(10, Number(value) || 0))

const difficultyClass = (difficulty) => {
  const normalized = String(difficulty || 'Interview').toLowerCase()
  if (normalized.includes('hard')) return 'hard'
  if (normalized.includes('easy')) return 'easy'
  return 'medium'
}

function Report({ report }) {
  const navigate = useNavigate()
  const finalScore = clampScore(report?.finalScore)
  const confidence = clampScore(report?.averageConfidence)
  const communication = clampScore(report?.averageCommunication)
  const correctness = clampScore(report?.averageCorrectness)
  const questions = Array.isArray(report?.questionWiseScore) ? report.questionWiseScore : []
  const [summary, summaryText] = scoreLabel(finalScore)
  const strongest = [{ name: 'Confidence', value: confidence }, { name: 'Communication', value: communication }, { name: 'Correctness', value: correctness }].sort((a, b) => b.value - a.value)[0]
  const weakest = [{ name: 'Confidence', value: confidence }, { name: 'Communication', value: communication }, { name: 'Correctness', value: correctness }].sort((a, b) => a.value - b.value)[0]
  const role = formatRoleTitle(report?.role || report?.interviewRole || 'Interview')
  const experience = report?.experience || report?.candidateExperience || 'Not provided'
  const skills = Array.isArray(report?.skills) ? report.skills : Array.isArray(report?.extractedSkills) ? report.extractedSkills : []
  const projects = Array.isArray(report?.projects) ? report.projects : []
  const interviewDate = report?.createdAt ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (!report) return (
    <main className="report-page">
      <div className="report-panel empty-report">
        <h1>No report available</h1>
        <p>Complete an interview to see your detailed analysis.</p>
      </div>
    </main>
  )

  return (
    <main className="report-page">
      <div className="report-shell">
        <header className="report-header report-panel">
          <div className="report-heading-block">
            <p className="report-kicker">Interview complete</p>
            <h1>Interview Report</h1>
          </div>

          <div className="report-header-meta">
            <span className="meta-badge">{role}</span>
            <span className="meta-date">{interviewDate}</span>
          </div>

          <button className="report-print" type="button" onClick={() => window.print()}>
            <FiDownload /> Download PDF
          </button>
        </header>

        <div className="report-grid">
          <section className="report-panel overview-panel">
            <div className="panel-header-row">
              <h2>Performance overview</h2>
              <span className="status-pill">Live score</span>
            </div>

            <div className="score-ring" style={{ '--score': finalScore * 10 }}>
              <div>
                <strong>{finalScore.toFixed(1)}</strong>
                <span>out of 10</span>
              </div>
            </div>

            <p className="score-summary">{summary}</p>
            <p className="score-subtitle">{summaryText}</p>

            <div className="score-metrics">
              {[
                ['Confidence', confidence],
                ['Communication', communication],
                ['Correctness', correctness],
              ].map(([name, value]) => (
                <div className="mini-metric" key={name}>
                  <div className="mini-header">
                    <span>{name}</span>
                    <strong>{value.toFixed(1)}</strong>
                  </div>
                  <div className="mini-track">
                    <span style={{ width: `${value * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="report-panel chart-panel">
            <div className="panel-header-row">
              <h2>Score by question</h2>
            </div>

            <div className="bar-chart">
              {questions.map((item, index) => {
                const value = clampScore(item.score)
                return (
                  <div className="bar-column" key={`${item.question || 'question'}-${index}`}>
                    <strong>{value.toFixed(1)}</strong>
                    <div className="bar" style={{ height: `${Math.max(value * 10, 12)}%` }} />
                    <span>Q{index + 1}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="report-panel candidate-panel">
            <div className="panel-header-row">
              <h2>Candidate context</h2>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Role</label>
                <p>{role}</p>
              </div>
              <div className="info-item">
                <label>Experience</label>
                <p>{experience}</p>
              </div>
            </div>

            <div className="context-block">
              <label>Extracted skills</label>
              <div className="chip-list">
                {skills.length ? skills.map((skill, index) => <span key={`${skill}-${index}`} className="skill-chip">{skill}</span>) : <span className="muted-text">No skills recorded</span>}
              </div>
            </div>

            <div className="context-block">
              <label>Projects</label>
              <div className="stack-list">
                {projects.length ? (
                  projects.map((project, index) => (
                    <div className="stack-card" key={`${typeof project === 'string' ? project : project.name || 'project'}-${index}`}>
                      <strong>{typeof project === 'string' ? project : project.name || 'Project'}</strong>
                      {typeof project === 'object' && project.description ? <p>{project.description}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="muted-text">No project details recorded</p>
                )}
              </div>
            </div>

          </section>

          <section className="report-panel insights-panel">
            <div className="panel-header-row">
              <h2>Performance notes</h2>
            </div>

            <div className="insight-grid">
              <div className="insight-box positive">
                <h3>What went well</h3>
                <ul>
                  <li>Your strongest area was <strong>{strongest.name.toLowerCase()}</strong> at {strongest.value.toFixed(1)}/10.</li>
                  <li>You completed {questions.length} question{questions.length === 1 ? '' : 's'} in this practice round.</li>
                </ul>
              </div>

              <div className="insight-box warning">
                <h3>What to improve</h3>
                <ul>
                  <li>Focus on <strong>{weakest.name.toLowerCase()}</strong> and add more structured examples.</li>
                  <li>Keep responses more concrete by tying examples back to business outcomes.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="report-panel question-panel">
            <div className="panel-header-row">
              <h2>Question breakdown</h2>
            </div>

            <div className="question-list">
              {questions.map((item, index) => (
                <article className="question-card" key={`${item.question || 'question'}-${index}`}>
                  <div className="question-top">
                    <span className="question-number">Question {index + 1}</span>
                    <span className={`question-difficulty ${difficultyClass(item.difficulty)}`}>{item.difficulty || 'Interview'}</span>
                    <span className="question-score">{clampScore(item.score).toFixed(1)} / 10</span>
                  </div>

                  <p className="question-text">{item.question}</p>

                  <div className="answer-box">
                    <strong>Your answer</strong>
                    <p>{item.answer || 'No answer was submitted.'}</p>
                  </div>

                  <div className="feedback-box">
                    <strong>AI feedback</strong>
                    <p>{item.feedback || 'No written feedback was returned for this answer.'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <button className="report-back" type="button" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to workspace
        </button>
      </div>
    </main>
  )
}

export default Report
import React from 'react'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import './report.css'

const scoreLabel = (score) => {
  if (score >= 8) return ['Strong performance', 'You have a solid base. Keep sharpening your examples and delivery.']
  if (score >= 6) return ['Good foundation', 'A little more structure and detail will make your answers stronger.']
  return ['Room to grow', 'Use this feedback as a clear starting point for your next practice round.']
}

function Report({ report }) {
  const navigate = useNavigate()
  const finalScore = Number(report?.finalScore) || 0
  const confidence = Number(report?.averageConfidence) || 0
  const communication = Number(report?.averageCommunication) || 0
  const correctness = Number(report?.averageCorrectness) || 0
  const questions = Array.isArray(report?.questionWiseScore) ? report.questionWiseScore : []
  const [summary, summaryText] = scoreLabel(finalScore)
  const strongest = [{ name: 'Confidence', value: confidence }, { name: 'Communication', value: communication }, { name: 'Correctness', value: correctness }].sort((a, b) => b.value - a.value)[0]
  const weakest = [{ name: 'Confidence', value: confidence }, { name: 'Communication', value: communication }, { name: 'Correctness', value: correctness }].sort((a, b) => a.value - b.value)[0]

  if (!report) return <main className="report-page"><div className="report-panel empty-report"><h1>No report available</h1><p>Complete an interview to see your detailed analysis.</p></div></main>

  return (
    <main className="report-page">
      <header className="report-header">
        <div><p className="report-kicker">Interview complete</p><h1>Your interview report</h1><p>AI-powered performance insights from this practice round.</p></div>
        <button className="report-print" type="button" onClick={() => window.print()}><FiDownload /> Download PDF</button>
      </header>

      <div className="report-layout">
        <aside className="report-panel">
          <section className="report-score">
            <h2>Overall performance</h2>
            <div className="score-ring" style={{ '--score': finalScore }}><div><strong>{finalScore.toFixed(1)}</strong><span>out of 10</span></div></div>
            <p className="score-summary">{summary}</p><p className="score-subtitle">{summaryText}</p>
          </section>
          <section className="report-section"><h2 className="report-panel-title">Skill evaluation</h2>{[['Confidence', confidence], ['Communication', communication], ['Correctness', correctness]].map(([name, value]) => <div className="dimension" key={name}><div className="dimension-label"><span>{name}</span><b>{value.toFixed(1)}</b></div><div className="dimension-track"><span style={{ width: `${value * 10}%` }} /></div></div>)}</section>
        </aside>

        <div className="report-main">
          <section className="report-panel chart-panel"><h2 className="report-panel-title">Score by question</h2><p className="chart-subtitle">See where your answers felt strongest across the round.</p><div className="bar-chart">{questions.map((item, index) => <div className="bar-column" key={`${item.question}-${index}`}><strong>{Number(item.score || 0).toFixed(1)}</strong><div className="bar" style={{ height: `${Math.max(Number(item.score || 0) * 10, 3)}%` }} /><span>Q{index + 1}</span></div>)}</div></section>
          <section className="report-insights"><div className="insight-box"><h3>What went well</h3><ul><li>Your strongest area was {strongest.name.toLowerCase()} at {strongest.value.toFixed(1)}/10.</li><li>You completed {questions.length} question{questions.length === 1 ? '' : 's'} in this practice round.</li></ul></div><div className="insight-box next"><h3>What to work on next</h3><ul><li>Focus on {weakest.name.toLowerCase()} and add more specific examples.</li><li>Try another round soon while this feedback is fresh.</li></ul></div></section>
          <section className="report-panel question-panel"><h2 className="report-panel-title">Question breakdown</h2>{questions.map((item, index) => <article className="question-card" key={`${item.question}-detail`}><div className="question-top"><span className="question-number">Question {index + 1}</span><span className={`question-difficulty ${String(item.difficulty || 'Interview').toLowerCase()}`}>{item.difficulty || 'Interview'}</span><span className="question-score">{Number(item.score || 0).toFixed(1)} / 10</span></div><p className="question-text">{item.question}</p><div className="candidate-answer"><strong>Your answer</strong><p>{item.answer || 'No answer was submitted.'}</p></div><p className="question-feedback"><strong>AI feedback</strong>{item.feedback || 'No written feedback was returned for this answer.'}</p></article>)}</section>
        </div>
      </div>
      <button className="report-back" type="button" onClick={() => navigate('/')}><FiArrowLeft /> Back to workspace</button>
    </main>
  )
}

export default Report
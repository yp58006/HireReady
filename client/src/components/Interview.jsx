import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { FiArrowRight, FiCheck, FiClock, FiMic, FiMicOff, FiVolume2 } from 'react-icons/fi'
import { serverurl } from '../App.jsx'
import './interview.css'

function Interview({ interviewdata, onfinish }) {
  const userData = useSelector((state) => state.user.userData)
  const questions = useMemo(() => interviewdata?.questions || [], [interviewdata])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60)
  const [isListening, setIsListening] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subtitle, setSubtitle] = useState('')
  const [lastFeedback, setLastFeedback] = useState('')
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(true)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const submitAnswerRef = useRef(null)
  const recognitionRef = useRef(null)
  const shouldListenRef = useRef(false)

  const currentQuestion = questions[questionIndex]
  const totalQuestions = questions.length || 1
  const progress = ((questionIndex + 1) / totalQuestions) * 100
  const currentTimeLimit = currentQuestion?.timeLimit || 60
  const timerProgress = isQuestionSpeaking ? 0 : (timeLeft / currentTimeLimit) * 360
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#2563eb'
  const sessionStatus = isQuestionSpeaking
    ? 'AI is speaking'
    : isListening
      ? 'AI is listening'
      : isSubmitting
        ? 'AI is preparing the next response'
        : 'Interview in progress'

  const playWarningTone = useCallback(() => {
    const AudioCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioCtor) return

    try {
      const context = new AudioCtor()
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = 800
      gainNode.gain.value = 0.03
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.08)
      setTimeout(() => context.close(), 120)
    } catch (error) {
      console.error('Warning sound failed:', error)
    }
  }, [])

  // Speak text and optionally show subtitles for the active question
  const speakText = useCallback((text, showSubtitle = true) => new Promise((resolve) => {
    if (!text) {
      resolve()
      return
    }

    if (showSubtitle) {
      setSubtitle(text)
    }
    if (!('speechSynthesis' in window)) {
      resolve()
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    let settled = false
    let hasStarted = false
    const finishSpeech = () => {
      if (settled) return
      settled = true
      window.clearTimeout(fallbackTimer)
      resolve()
    }
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onstart = () => { hasStarted = true }
    utterance.onend = finishSpeech
    utterance.onerror = finishSpeech
    const fallbackTimer = window.setTimeout(() => {
      if (!hasStarted) finishSpeech()
    }, 1500)
    window.speechSynthesis.speak(utterance)
  }), [])

  // Read introduction and questions
  useEffect(() => {
    if (!currentQuestion) return undefined

    setLastFeedback('')

    let cancelled = false
    const rawUsername = interviewdata?.username || interviewdata?.userName || interviewdata?.user?.name || userData?.name || userData?.fullName || userData?.user?.name || 'there'
    const username = String(rawUsername).split(' ')[0]
    const text = questionIndex === 0
      ? `Hi ${username}, I am your AI interview coach. We will begin with a few questions, so take your time and answer clearly. ${currentQuestion.question}`
      : currentQuestion.question

    setIsQuestionSpeaking(true)
    speakText(text, true).then(() => {
      if (!cancelled) setIsQuestionSpeaking(false)
    })

    return () => {
      cancelled = true
      window.speechSynthesis?.cancel()
    }
  }, [currentQuestion, interviewdata?.username, interviewdata?.userName, interviewdata?.user?.name, userData?.name, userData?.fullName, userData?.user?.name, questionIndex, speakText])

  // Stop speech when interview screen closes
  useEffect(() => () => window.speechSynthesis?.cancel(), []) 

  // Reset For Every new Question 
  useEffect(() => {
    setTimeLeft(currentQuestion?.timeLimit || 60)
    setAnswer('')
    setInterimTranscript('')
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [currentQuestion])

  // Start browser speech recognition
  const startListening = () => {
    if (isQuestionSpeaking || isSubmitting) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      window.alert('Speech input is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    shouldListenRef.current = true
    recognition.onresult = (event) => {
      const results = Array.from(event.results).slice(event.resultIndex)
      const finalTranscript = results
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ')
      const currentTranscript = results
        .filter((result) => !result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ')

      if (finalTranscript) {
        setAnswer((value) => `${value}${value ? ' ' : ''}${finalTranscript}`)
        setVoiceStatus('Speech added to your answer')
      }
      setInterimTranscript(currentTranscript)
    }
    recognition.onstart = () => setVoiceStatus('Listening... speak now')
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
        shouldListenRef.current = false
        setIsListening(false)
        setVoiceStatus('Microphone permission or hardware failed')
        window.alert('Microphone access failed. Please allow microphone access and try again.')
      } else if (event.error === 'no-speech') {
        setVoiceStatus('No speech heard, still listening...')
      } else if (event.error === 'network') {
        shouldListenRef.current = false
        setIsListening(false)
        setVoiceStatus('Speech service unavailable. Use Chrome or Edge with internet access.')
      } else {
        setVoiceStatus(`Speech recognition error: ${event.error}`)
      }
    }
    recognition.onend = () => {
      if (!shouldListenRef.current || recognitionRef.current !== recognition) {
        setIsListening(false)
        return
      }

      window.setTimeout(() => {
        if (!shouldListenRef.current || recognitionRef.current !== recognition) return
        try {
          recognition.start()
          setIsListening(true)
          setVoiceStatus('Listening... speak now')
        } catch (error) {
          console.error('Could not restart speech recognition:', error)
          shouldListenRef.current = false
          setIsListening(false)
          setVoiceStatus('Speech recognition stopped. Click the microphone to retry.')
        }
      }, 150)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setIsListening(true)
    } catch (error) {
      console.error('Could not start speech recognition:', error)
      shouldListenRef.current = false
      setIsListening(false)
      setVoiceStatus('Microphone could not start')
      window.alert('The microphone could not start. Please allow microphone access and try again.')
    }
  }

  // Stop browser speech recognition
  const stopListening = () => {
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimTranscript('')
    setVoiceStatus('Microphone stopped')
  }

  // Clean up microphone session
  useEffect(() => () => {
    shouldListenRef.current = false
    recognitionRef.current?.stop()
  }, [])

  // The CountDown Timer
  useEffect(() => {
    if (!currentQuestion || isSubmitting || isQuestionSpeaking) return undefined // Invalid Question
    if (timeLeft <= 0) { // Times Over
      submitAnswerRef.current?.() // Submit Answer
      return undefined
    }

    if (timeLeft <= 10) {
      playWarningTone()
    }

    const timer = window.setInterval(() => setTimeLeft((value) => value - 1), 1000) // set interval used
    return () => window.clearInterval(timer) // Imp to clear interval after every Unmount or removal of component , Called By Readt Itself
    // its a Self CleanUp Function of Use Effect
  }, [timeLeft, currentQuestion, isSubmitting, isQuestionSpeaking, playWarningTone])

  const submitAnswer = async () => {
    if (!currentQuestion || isSubmitting) return
    const submittedAnswer = [answer, interimTranscript].filter(Boolean).join(' ')
    stopListening()
    setIsSubmitting(true)
    try {
      const answerResponse = await axios.post(`${serverurl}/api/interview/submitanswer`, {
        interviewid: interviewdata.interviewid,
        questionindex: questionIndex,
        answer: submittedAnswer,
        timetaken: (currentQuestion.timeLimit || 60) - timeLeft,
      }, { withCredentials: true })

      const feedbackText = answerResponse.data?.feedback || 'Your answer has been recorded. Let’s continue.'
      setLastFeedback(feedbackText)
      await speakText(feedbackText, false)

      if (questionIndex === questions.length - 1) {
        const report = await axios.post(`${serverurl}/api/interview/finish`, {
          interviewid: interviewdata.interviewid,
        }, { withCredentials: true })
        onfinish?.(report.data)
      } else {
        setIsQuestionSpeaking(true)
        setQuestionIndex((value) => value + 1)
      }
    } catch (error) {
      console.error('Failed to submit interview answer', error)
      window.alert('Your answer could not be submitted. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  submitAnswerRef.current = submitAnswer

  if (!currentQuestion) {
    return <main className="interview-shell"><div className="interview-empty">No interview questions are available.</div></main>
  }

  return (
    <main className="interview-shell">
      <div className="interview-topbar">
        <div>
          <span className="eyebrow">Live interview</span>
          <h1>Show what you know.</h1>
        </div>
        <div className="session-chip">
          <span className="live-dot" />
          Session in progress
        </div>
      </div>

      <section className="interview-board">
        <aside className="interview-sidebar">
          <div className="ai-video-panel" aria-label="AI interviewer video area">
            <div className="ai-avatar-ring">
              <div className="ai-avatar">AI</div>
            </div>
            <div className="micro-wave">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="welcome-note">
            <span className="note-label">Your AI interviewer</span>
            <strong>AI Interview Coach</strong>
            <p>Take a breath, think clearly, and answer as you would in a real conversation.</p>
          </div>

          <div className="status-panel">
            <div className="status-heading">
              <span>Interview status</span>
              <b>{isSubmitting ? 'Processing' : 'In progress'}</b>
            </div>

            <div
              className="timer-ring"
              style={{
                background: `conic-gradient(${timerColor} ${timerProgress}deg, #e7eef9 0)`,
              }}
            >
              <div>
                <FiClock />
                <strong>{isQuestionSpeaking ? 'Ready' : `${timeLeft}s`}</strong>
                <span>{isQuestionSpeaking ? 'Listen first' : 'remaining'}</span>
              </div>
            </div>

            <div className="question-count">
              <span><b>{questionIndex + 1}</b> Current question</span>
              <span><b>{questions.length}</b> Total</span>
            </div>
          </div>
        </aside>

        <div className="answer-panel">
          <div className="question-bar">
            <div className="question-meta">
              <span>Question {String(questionIndex + 1).padStart(2, '0')}</span>
              <span className={`difficulty ${currentQuestion.difficulty}`}>{currentQuestion.difficulty || 'Interview'}</span>
            </div>
            <div className="status-pill">{sessionStatus}</div>
          </div>

          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="interviewer-card" aria-live="polite">
            <div className="conversation-header">
              <span>AI Interviewer</span>
              <button
                className="replay-button"
                type="button"
                onClick={() => speakText(subtitle || currentQuestion.question)}
                aria-label="Replay interviewer speech"
                title="Replay interviewer speech"
              >
                <FiVolume2 /> Replay
              </button>
            </div>

            <p className="current-message">{subtitle || currentQuestion.question}</p>

            {lastFeedback && (
              <div className="feedback-strip">
                <strong>Feedback</strong>
                <p>{lastFeedback}</p>
              </div>
            )}
          </div>

          <div className="answer-box">
            <label className="answer-label" htmlFor="answer">Your answer</label>
            <textarea
              id="answer"
              value={[answer, interimTranscript].filter(Boolean).join(' ')}
              onChange={(event) => {
                setAnswer(event.target.value)
                setInterimTranscript('')
              }}
              placeholder="Type your answer here..."
            />

            <div className="answer-footer">
              <button
                className={`mic-button ${isListening ? 'active' : ''}`}
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isQuestionSpeaking || isSubmitting}
                aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
                title={isListening ? 'Stop microphone' : 'Start microphone'}
              >
                {isListening ? <FiMicOff /> : <FiMic />}
              </button>

              <span className="answer-hint">
                {isListening ? voiceStatus || 'Listening...' : voiceStatus || 'You can also answer by voice'}
              </span>

              <button className="submit-button" type="button" onClick={submitAnswer} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : questionIndex === questions.length - 1 ? <><FiCheck /> Finish interview</> : <>Submit Answer <FiArrowRight /></>}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Interview

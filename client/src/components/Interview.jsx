import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { FiArrowRight, FiCheck, FiClock, FiMic, FiMicOff, FiVolume2 } from 'react-icons/fi'
import { serverurl } from '../App.jsx'
import './interview.css'

function Interview({ interviewdata, onfinish }) {
  const questions = useMemo(() => interviewdata?.questions || [], [interviewdata])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60)
  const [isListening, setIsListening] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subtitle, setSubtitle] = useState('')
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(true)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const submitAnswerRef = useRef(null)
  const recognitionRef = useRef(null)
  const shouldListenRef = useRef(false)

  const currentQuestion = questions[questionIndex]
  const totalQuestions = questions.length || 1
  const progress = ((questionIndex + 1) / totalQuestions) * 100

  // Speak text and show subtitles
  const speakText = useCallback((text) => new Promise((resolve) => {
    if (!text) {
      resolve()
      return
    }

    setSubtitle(text)
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

    let cancelled = false
    const username = interviewdata?.username || 'there'
    const text = questionIndex === 0
      ? `Welcome, ${username}. I am your AI interview coach. We will begin with a few questions, so take your time and answer clearly. ${currentQuestion.question}`
      : currentQuestion.question

    setIsQuestionSpeaking(true)
    speakText(text).then(() => {
      if (!cancelled) setIsQuestionSpeaking(false)
    })

    return () => {
      cancelled = true
      window.speechSynthesis?.cancel()
    }
  }, [currentQuestion, interviewdata?.username, questionIndex, speakText])

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
    const timer = window.setInterval(() => setTimeLeft((value) => value - 1), 1000) // set interval used
    return () => window.clearInterval(timer) // Imp to clear interval after every Unmount or removal of component , Called By Readt Itself
    // its a Self CleanUp Function of Use Effect
  }, [timeLeft, currentQuestion, isSubmitting, isQuestionSpeaking])

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

      console.log(answerResponse);
      // Read feedback before moving forward
      await speakText(answerResponse.data?.feedback || 'Your answer has been recorded.')

      if (questionIndex === questions.length - 1) {
        const report = await axios.post(`${serverurl}/api/interview/finish`, {
          interviewid: interviewdata.interviewid,
        }, { withCredentials: true })
        onfinish?.(report.data)
        console.log(report);
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
        <div className="session-chip"><span className="live-dot" /> Session in progress</div>
      </div>

      <section className="interview-board">
        <aside className="interview-sidebar">
          <div className="avatar-placeholder" aria-label="Media placeholder">MEDIA PLACEHOLDER</div>
          <div className="welcome-note">
            <span className="note-label">Your interviewer</span>
            <strong>AI Interview Coach</strong>
            <p>Take a breath, think clearly, and answer as you would in a real conversation.</p>
          </div>

          <div className="status-panel">
            <div className="status-heading"><span>Interview status</span><b>In progress</b></div>
            <div className="timer-ring" style={{ '--timer-progress': `${isQuestionSpeaking ? 0 : (timeLeft / (currentQuestion.timeLimit || 60)) * 360}deg` }}>
              <div><FiClock /><strong>{isQuestionSpeaking ? 'Ready' : `${timeLeft}s`}</strong><span>{isQuestionSpeaking ? 'Listen first' : 'remaining'}</span></div>
            </div>
            <div className="question-count"><span><b>{questionIndex + 1}</b> Current question</span><span><b>{questions.length}</b> Total questions</span></div>
          </div>
        </aside>

        <div className="answer-panel">
          <div className="question-meta"><span>Question {String(questionIndex + 1).padStart(2, '0')}</span><span className={`difficulty ${currentQuestion.difficulty}`}>{currentQuestion.difficulty || 'Interview'}</span></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <div className="interviewer-subtitle" aria-live="polite">
            <span>Interviewer</span>
            <p>{subtitle || 'Click start when you are ready.'}</p>
            <button className="replay-button" type="button" onClick={() => speakText(subtitle || currentQuestion.question)} aria-label="Replay interviewer speech" title="Replay interviewer speech">
              <FiVolume2 /> Replay
            </button>
          </div>
          <h2>{currentQuestion.question}</h2>
          <label className="answer-label" htmlFor="answer">Your answer</label>
          <textarea id="answer" value={[answer, interimTranscript].filter(Boolean).join(' ')} onChange={(event) => { setAnswer(event.target.value); setInterimTranscript('') }} placeholder="Take your time and type your answer here..." />
          <div className="answer-footer">
            <button className={`mic-button ${isListening ? 'active' : ''}`} type="button" onClick={isListening ? stopListening : startListening} disabled={isQuestionSpeaking || isSubmitting} aria-label={isListening ? 'Stop microphone' : 'Start microphone'} title={isListening ? 'Stop microphone' : 'Start microphone'}>
              {isListening ? <FiMicOff /> : <FiMic />}
            </button>
            <span className="answer-hint">{isListening ? voiceStatus || 'Listening...' : voiceStatus || 'You can also answer by voice'}</span>
            <button className="submit-button" type="button" onClick={submitAnswer} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : questionIndex === questions.length - 1 ? <><FiCheck /> Finish interview</> : <>Submit answer <FiArrowRight /></>}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Interview

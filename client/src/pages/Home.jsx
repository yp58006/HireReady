import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { FiArrowRight, FiLogOut, FiMenu, FiStar, FiX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { serverurl } from '../App.jsx'
import { setUserdata } from '../redux/slices/userSlice.js'
import './home.css'

const navLinks = [
  { label: 'Home', to: '/' }, { label: 'Practice', to: '/setup' }, { label: 'Interviews', to: '/interviews' },
  { label: 'Resume', to: '#toolkit' }, { label: 'Resources', to: '#paths' },
]

const paths = [
  { label: 'Technical round', title: 'Technical Interview', text: 'Sharpen concepts, problem-solving, and technical thinking.', to: '/setup' },
  { label: 'Your story', title: 'Behavioral Interview', text: 'Practice telling your experience with confidence.', to: '/setup' },
  { label: 'Your experience', title: 'Resume-Based Interview', text: 'Get questions based on your projects and work.', to: '/setup' },
  { label: 'Short session', title: 'Quick Practice', text: 'A focused round when you only have a few minutes.', to: '/setup' },
]

const reveal = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: .5 } } }

function Home() {
  const userData = useSelector((state) => state.user.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const name = userData?.name?.split(' ')[0] || 'there'
  const initials = (userData?.name || 'User').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const logout = async () => {
    try { await axios.get(`${serverurl}/api/auth/logout`, { withCredentials: true }) } catch (error) { console.error('Logout error:', error) }
    dispatch(setUserdata(null))
    navigate('/Auth')
  }

    return (
      <div className="home-page">
        <header className="home-nav">
          <Link className="home-brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="home-brand-mark">H</span>
            <span>HireReady<small>Interview lab</small></span>
          </Link>
          <nav className={`home-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => <Link key={link.label} className={link.label === 'Home' ? 'active' : ''} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
          </nav>
          <div className="home-nav-right">
            {userData && <span className="home-credits"><FiStar /> {userData.credits ?? 0} credits</span>}
            <div className="home-avatar">{userData?.image ? <img src={userData.image} alt={userData.name || 'User'} /> : initials}</div>
            {userData ? <button className="home-logout" type="button" onClick={logout} title="Log out"><FiLogOut /></button> : <Link className="home-login" to="/Auth">Sign in</Link>}
            <button className="home-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">{menuOpen ? <FiX /> : <FiMenu />}</button>
          </div>
        </header>

        <main className="home-main">
          <motion.section className="home-intro" initial="hidden" animate="visible" variants={reveal}>
            <p className="home-kicker">Your preparation space</p>
            <h1>{greeting}, {name}.</h1>
            <p>One good answer at a time, you are getting interview-ready. Keep your next conversation in sight.</p>
          </motion.section>

          <motion.section className="studio" initial="hidden" animate="visible" variants={reveal} transition={{ delay: .12 }}>
            <div className="studio-copy">
              <span className="studio-label">Interview studio</span>
              <h2>Ready when you are.</h2>
              <p>Step into a realistic interview built around your role and experience. Practice under pressure, improve without it.</p>
              <div className="studio-actions"><Link className="home-primary" to="/setup">Start an interview <FiArrowRight /></Link><Link className="home-secondary" to="/setup">Customize first</Link></div>
            </div>
            <div className="studio-visual" aria-hidden="true">
              <div className="waveform">{Array.from({ length: 17 }, (_, index) => <i key={index} />)}</div>
              <div className="studio-prompt"><strong>Live practice</strong>Questions shaped around the way you want to prepare.</div>
            </div>
          </motion.section>

          <motion.section className="home-section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
            <div className="section-heading"><h2>Your momentum</h2><p>A quiet start is still a start.</p></div>
            <div className="progress-story"><div className="progress-main"><strong>0</strong><span>practice sessions this week</span><div className="progress-dots"><i /><i /><i /><i /><i /></div><p>Your progress starts with your first conversation.</p></div><div className="insight"><span className="insight-marker" /><div><strong>Let&apos;s make the next one better.</strong><p>Try a technical round today and build a rhythm that lasts.</p></div></div></div>
          </motion.section>

          <motion.section className="home-section" id="paths" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
            <div className="section-heading"><h2>What do you want to work on?</h2><p>Choose a path for today.</p></div>
            <div className="path-grid">{paths.map((path) => <Link className="path" to={path.to} key={path.title}><span>{path.label}</span><strong>{path.title}<FiArrowRight /></strong><p>{path.text}</p></Link>)}</div>
          </motion.section>

          <motion.section className="home-section" id="toolkit" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
            <div className="section-heading"><h2>More ways to prepare</h2><p>Keep building a stronger application.</p></div>
            <div className="toolkit-grid"><div className="tool"><strong>Resume Review</strong><p>See how well your resume matches the role you are aiming for.</p></div><div className="tool"><strong>Interview History</strong><p>Revisit past sessions and see how your answers evolve.</p></div></div>
          </motion.section>
          <p className="home-footer">HireReady / A little practice goes a long way.</p>
        </main>
      </div>
    )
  }

    export default Home
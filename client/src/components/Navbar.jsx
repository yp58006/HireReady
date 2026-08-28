import axios from 'axios'
import React from 'react'
import { FiLogOut, FiStar } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { serverurl } from '../App'
import { setUserdata } from '../redux/slices/userSlice'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Practice', to: '/practice' },
  { label: 'Interviews', to: '/interviews' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Resources', to: '/resources' },
]

function Navbar() {
  const userData = useSelector((state) => state.user.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const profileImage = userData?.image || userData?.avatar || userData?.photo || userData?.profileImage
  const initials = (userData?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const handleLogout = async () => {
    try {
      await axios.get(serverurl + '/api/auth/logout', { withCredentials: true })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(setUserdata(null))
      navigate('/Auth')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
            H
          </div>
          <div className="text-left leading-none">
            <p className="text-lg font-bold text-white">HireReady</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-400">
              AI Interview Lab
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {userData ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200 sm:flex">
                <FiStar className="text-base" />
                <span>{userData.credits ?? 0} credits</span>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1.5 shadow-lg shadow-slate-950/40">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-white">
                  {profileImage ? (
                    <img src={profileImage} alt={userData.name || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-white">{userData.name || 'User'}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Member</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
                >
                  <FiLogOut className="text-base" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/Auth"
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/40 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/Auth"
                className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
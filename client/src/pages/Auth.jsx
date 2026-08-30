import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleAuthProvider } from '../utils/firebase'
import { serverurl } from '../App'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserdata } from '../redux/slices/userSlice'

function Auth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, googleAuthProvider)
      const user = response.user
      const name = user.displayName
      const email = user.email
      const image = user.photoURL

      const result = await axios.post(`${serverurl}/api/auth/google`, { name, email, image }, { withCredentials: true })

      dispatch(setUserdata(result.data))
      navigate('/')
    } catch (error) {
      console.log(error)
      dispatch(setUserdata(null))
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8fb] px-4 py-8">
      <div className="absolute -left-12 top-10 h-64 w-64 rounded-full bg-[#d9eff5] opacity-70 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#e5f4ef] opacity-80 blur-3xl" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f1f6ff] opacity-80 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
          <div className="mb-7 flex items-center justify-center gap-3 text-slate-800">
            <img src="/Images/PlatformImage.png" alt="HireReady logo" className="h-10 w-10 rounded-xl object-cover" />
            <span className="text-lg font-semibold tracking-tight">HireReady</span>
          </div>

          <div className="mb-7 text-center">
            <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-slate-900">
              Practice with purpose.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Turn mock interviews into real confidence with focused prep and meaningful feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2"
          >
            <img src="/Images/GoogleIcon.png" alt="Google" className="h-5 w-5 flex-shrink-0" />
            Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
              Secure access
            </span>
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700">Flexible sign in</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Email and password login can be added here later without a full redesign.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
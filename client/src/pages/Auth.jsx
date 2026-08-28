import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleAuthProvider } from '../utils/firebase'
import { serverurl } from '../App'
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux'
import { setUserdata } from '../redux/slices/userSlice';

function Auth() {
  
  const dispatch = useDispatch()
  const navigate = useNavigate()


  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, googleAuthProvider)
      let user = response.user;
      let name = user.displayName;
      let email = user.email;
      console.log(response);
      const result = await axios.post(serverurl + "/api/auth/google", {name, email}, {withCredentials:true});
      console.log("Auth successful:", result.data);
      dispatch(setUserdata(result.data));
      navigate('/');
    } catch (error) {
      console.log(error)
      dispatch(setUserdata(null));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-6 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            HireReady
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Practice. Perform. Get hired.</h1>
          <p className="mt-3 text-sm text-slate-600">
            Ace your mock interviews and build confidence before the real big day.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.7C16.8 3.1 14.6 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 11.4-4.8 11.4-11.6 0-.8-.1-1.4-.2-2H12z"
            />
            <path
              fill="#34A853"
              d="M3.9 7.1l3.6 2.6c1-1.9 3.2-3.2 5.5-3.2 1.9 0 3.2.8 3.9 1.5l2.7-2.7C16.8 3.1 14.6 2.2 12 2.2 8.3 2.2 5.1 4.5 3.9 7.1z"
            />
            <path
              fill="#FBBC05"
              d="M3.9 15.7A9.3 9.3 0 0 1 3.5 11.4c0-.8.1-1.5.3-2.3l3.8 2.8a5.7 5.7 0 0 0-.2 1.5c0 .5.1 1 .2 1.5L3.9 15.7z"
            />
            <path
              fill="#4285F4"
              d="M12 20.6c2.3 0 4.3-.8 5.8-2.2l-2.7-2.3c-.7.5-1.7.9-3.1.9-2.3 0-4.2-1.5-5.1-3.6l-3.7 2.8A9.3 9.3 0 0 0 12 20.6z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

export default Auth
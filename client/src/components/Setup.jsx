import React, {useState} from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { serverurl } from '../App.jsx'
import { setUserdata } from '../redux/slices/userSlice.js'
import "../components/setup.css"

export default function Setup({ onstart }){
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [type, setType] = useState('technical')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const onFileChange = (e) => {
    setFile(e.target.files[0] || null)
    setAnalysis(null)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    try{
      let resumetxt = ''
      let projects = []
      let skills = []

      if(file){
        const fd = new FormData()
        fd.append("resume", file)
        fd.append('role', role)
        fd.append('experience', experience)
        fd.append('interviewType', type)

        const res = await axios.post(serverurl + "/api/interview/resume", fd, {withCredentials:true});
        const data = res.data
        const result = (data && data.result) ? data.result : {}
        skills = Array.isArray(result.skills) ? result.skills : []
        projects = Array.isArray(result.projects) ? result.projects : []
        resumetxt = data.text || ''
        const experiences = Array.isArray(result.experience) ? result.experience : []

        setAnalysis({ raw: data, skills, projects, experiences })
      } else {
        setAnalysis(null)
      }

      const response = await axios.post(serverurl + "/api/interview/generatequestion", {role, experience, mode: type, resumetxt, projects, skills}, {withCredentials:true});
      const interviewData = response.data

      console.log(response.data);

      dispatch(setUserdata({
        ...userData,
        credits: interviewData.creditsleft,
      }))
      onstart?.(interviewData)
      
    }catch(err){
      console.error('Error calling analyze endpoint', err)
      alert('Failed to start the interview. See console for details.')
    }finally{
      setLoading(false)
    }
  }

  const handlestart = async ()=>{

  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-left">
          <h2>Interview Setup</h2>
          <p className="muted">Tell us a little about yourself. Uploading a resume is optional and helps us tailor the interview.</p>

          <div className="form-group">
            <label>Role</label>
            <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Backend Engineer" />
          </div>

          <div className="two-cols">
            <div className="form-group small">
              <label>Experience (yrs)</label>
              <input type="number" value={experience} onChange={e=>setExperience(e.target.value)} placeholder="3" />
            </div>

            <div className="form-group small">
              <label>Interview Type</label>
              <select value={type} onChange={e=>setType(e.target.value)}>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="managerial">Managerial</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Upload Resume (optional)</label>
            <div className="file-row">
              <input className="file-input" type="file" accept=".pdf" onChange={onFileChange} />
              <button className="btn primary" onClick={handleAnalyze} disabled={loading}>{loading ? (file ? 'Analyzing...' : 'Starting...') : (file ? 'Analyze Resume' : 'Start Interview')}</button>
            </div>
            {file && <div className="file-info">Selected file: <strong>{file.name}</strong></div>}
          </div>

        </div>

        <div className="setup-right">
          <div className="card small">
            <h4>Resume Preview</h4>
            {file ? (
              <div className="preview-body">
                <div className="file-name">{file.name}</div>
                <div className="meta">Role: {role || '—'} • Exp: {experience || '—'} yrs • Type: {type}</div>
              </div>
            ) : (
              <div className="preview-empty">No resume uploaded yet</div>
            )}
          </div>

          <div className="card">
            <h4>Extracted Skills</h4>
            {analysis && analysis.skills && analysis.skills.length ? (
              <div className="skills-list">
                {analysis.skills.map((s,i)=>(<span key={i} className="skill-badge">{s}</span>))}
              </div>
            ) : (
              <div className="muted">Skills will appear here after analysis</div>
            )}
          </div>

          <div className="card">
            <h4>Projects (short)</h4>
            {analysis && analysis.projects && analysis.projects.length ? (
              <ul className="projects-list">
                {analysis.projects.map((p,i)=>(<li key={i}>{typeof p === 'string' ? p : (p.name || JSON.stringify(p))}</li>))}
              </ul>
            ) : (
              <div className="muted">Projects will appear here after analysis</div>
            )}
          </div>

          <div className="card">
            <h4>Experience</h4>
            {analysis && analysis.experiences && analysis.experiences.length ? (
              <ul className="experience-list">
                {analysis.experiences.map((item, i) => {
                  const company = typeof item === 'string'
                    ? item
                    : (item.company || item.companyName || 'Company not specified')
                  const experience = typeof item === 'string'
                    ? ''
                    : (item.experience || item.duration || item.years || '')

                  return (
                    <li key={i}>
                      <strong>{company}</strong>
                      {experience && <span> — {experience}</span>}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="muted">Experience will appear here after analysis</div>
            )}
          </div>

          {analysis && (
            <div className="card raw">
              <h4>Raw response</h4>
              <pre>{JSON.stringify(analysis.raw, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

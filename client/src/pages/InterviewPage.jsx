import React, { useState } from 'react';
import Setup from '../components/Setup.jsx'
import Interview from '../components/Interview.jsx'
import Report from '../components/Report.jsx'
function InterviewPage() {
  const [step, setStep] = useState(1)
  const [interviewdata, setinterviewdata] = useState(null);
  return (
    <div>
        {step===1 && <Setup onstart = {(data)=>{
            setinterviewdata(data);
            setStep(2);
        }}/>}

        {step===2 && <Interview interviewdata={interviewdata} 
            onfinish={(report)=>{setinterviewdata(report);  setStep(3);}
        }/>}

        {step===3 && <Report report={interviewdata} 
        />}

    </div>
  )
}

export default InterviewPage
'use client'
import { FormEvent, useState } from 'react'

export default function ApplyPage(){
  const [done,setDone]=useState<string|null>(null)
  const [error,setError]=useState('')
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError('')
    const form=new FormData(e.currentTarget)
    const body={
      applicantName:String(form.get('applicantName')),
      email:String(form.get('email')),
      phone:String(form.get('phone')||''),
      program:String(form.get('program')),
      intake:String(form.get('intake')),
      residency:String(form.get('residency')),
      admissionMode:String(form.get('admissionMode')),
      academicDetails:{
        qualification:String(form.get('qualification')||''),
        score:String(form.get('score')||''),
        school:String(form.get('school')||''),
        yearOfPassing:String(form.get('yearOfPassing')||'')
      }
    }
    const res=await fetch('/api/admissions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})
    const data=await res.json()
    if(!res.ok){setError(data.error||'Could not submit application');return}
    setDone(data.application.applicationNo)
  }
  return <main className="auth-page"><div className="auth-card wide"><a className="back" href="/">← Back to Aura</a><span className="auth-kicker">ADMISSIONS 2026</span><h1>Start your Aura application</h1><p>Submit your details securely. You will receive an application number immediately.</p>{done?<div className="success"><h2>Application submitted ✓</h2><p>Your application number is <strong>{done}</strong>.</p><a className="btn primary" href="/">Return home</a></div>:<form onSubmit={submit} className="apply-form"><label>Applicant name<input name="applicantName" required minLength={2}/></label><label>Email<input type="email" name="email" required/></label><label>Phone<input name="phone"/></label><label>Program<select name="program" defaultValue="B.Tech Computer Science"><option>B.Tech Computer Science</option><option>B.Des Product Design</option><option>BBA Innovation</option></select></label><label>Intake<select name="intake"><option>2026</option><option>2027</option></select></label><label>Admission route<select name="admissionMode"><option value="CET">CET</option><option value="COMEDK">COMEDK</option><option value="MANAGEMENT_QUOTA">Management Quota</option></select></label><label>Residency<select name="residency"><option>HOSTEL</option><option>DAY_SCHOLAR</option></select></label><label>Highest qualification<input name="qualification"/></label><label>Academic score / percentage<input name="score"/></label><label>School / College<input name="school"/></label><label>Year of passing<input name="yearOfPassing"/></label>{error&&<div className="error">{error}</div>}<button className="btn primary">Submit application →</button></form>}</div></main>
}

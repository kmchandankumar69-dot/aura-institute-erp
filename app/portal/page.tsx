'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: string; email: string; name: string; role: 'STUDENT' | 'FACULTY' | 'ADMIN'; studentId?: string }
type EventItem = { _id: string; title: string; date: string; time?: string; venue?: string; capacity: number; registeredCount: number; registrations?: any[]; description?: string }
type RevaluationSubjectItem = { _id: string; name: string; code: string; semester: number; active: boolean }
type TimetableItem = { _id: string; subject: string; subjectCode: string; semester: number; examDate: string; startTime: string; endTime: string; examType: 'THEORY' | 'PRACTICAL'; assessment: '1ST_INTERNAL' | '2ND_INTERNAL' | '3RD_INTERNAL' | 'MAIN_EXAM'; venue?: string }
type PlacementItem = { _id: string; companyName: string; jobRole: string; salary: string; skillsRequired: string[]; minCgpa: number; description?: string; applicationDeadline?: string; application?: any; currentCgpa?: number | null; currentSemester?: number | null; eligibleByCgpa?: boolean | null; eligibleSemesters?: number[]; eligibleBySemester?: boolean }

export default function Portal() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [data, setData] = useState<any>(null)
  const [apps, setApps] = useState<any[]>([])
  const [revals, setRevals] = useState<any[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [placements, setPlacements] = useState<PlacementItem[]>([])
  const [placementAdmin, setPlacementAdmin] = useState<any>(null)
  const [studentsAdmin, setStudentsAdmin] = useState<any>(null)
  const [studentPhotosAdmin, setStudentPhotosAdmin] = useState<any[]>([])
  const [revaluationSubjects, setRevaluationSubjects] = useState<RevaluationSubjectItem[]>([])
  const [timetable, setTimetable] = useState<TimetableItem[]>([])
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadPortal(role: User['role']) {
    if (role === 'STUDENT') {
      const [dashboard, eventResponse, placementResponse, subjectResponse, timetableResponse] = await Promise.all([
        fetch('/api/student/dashboard', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/placements', { cache: 'no-store' }),
        fetch('/api/student/revaluation-subjects', { cache: 'no-store' }),
        fetch('/api/student/timetable', { cache: 'no-store' }),
      ])
      if (dashboard.ok) setData(await dashboard.json())
      if (eventResponse.ok) setEvents((await eventResponse.json()).events || [])
      if (placementResponse.ok) setPlacements((await placementResponse.json()).placements || [])
      if (subjectResponse.ok) setRevaluationSubjects((await subjectResponse.json()).subjects || [])
      if (timetableResponse.ok) setTimetable((await timetableResponse.json()).timetable || [])
    } else {
      const [applicationResponse, revaluationResponse, eventResponse, placementResponse, studentsResponse, photoResponse, subjectResponse, timetableResponse] = await Promise.all([
        fetch('/api/admissions', { cache: 'no-store' }),
        fetch('/api/faculty/revaluations', { cache: 'no-store' }),
        fetch('/api/faculty/events', { cache: 'no-store' }),
        role === 'ADMIN' ? fetch('/api/faculty/placements', { cache: 'no-store' }) : Promise.resolve(null),
        role === 'ADMIN' ? fetch('/api/faculty/students', { cache: 'no-store' }) : Promise.resolve(null),
        role === 'ADMIN' ? fetch('/api/admin/student-photos', { cache: 'no-store' }) : Promise.resolve(null),
        role === 'ADMIN' ? fetch('/api/admin/revaluation-subjects', { cache: 'no-store' }) : Promise.resolve(null),
        role === 'ADMIN' ? fetch('/api/admin/timetable', { cache: 'no-store' }) : Promise.resolve(null),
      ])
      if (applicationResponse.ok) setApps((await applicationResponse.json()).applications || [])
      if (revaluationResponse.ok) setRevals((await revaluationResponse.json()).requests || [])
      if (eventResponse.ok) setEvents((await eventResponse.json()).events || [])
      if (placementResponse?.ok) setPlacementAdmin(await placementResponse.json())
      if (studentsResponse?.ok) setStudentsAdmin(await studentsResponse.json())
      if (photoResponse?.ok) setStudentPhotosAdmin((await photoResponse.json()).students || [])
      if (subjectResponse?.ok) setRevaluationSubjects((await subjectResponse.json()).subjects || [])
      if (timetableResponse?.ok) setTimetable((await timetableResponse.json()).timetable || [])

    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!me.ok) { router.replace('/login'); return }
        const m = await me.json()
        if (cancelled) return
        setUser(m.user)
        await loadPortal(m.user.role)
      } catch { setError('Could not load the secure portal. Please refresh and try again.') }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [router])

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/') }

  async function publish() {
    if (!notice.trim()) return
    const r = await fetch('/api/faculty/notices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'Faculty notice', body: notice, audience: 'ALL' }) })
    if (r.ok) setNotice('')
  }

  if (loading) return <main className="portal-page"><div className="portal-loading">Loading secure portal…</div></main>
  if (error) return <main className="portal-page"><div className="portal-loading">{error}</div></main>

  return <main className="portal-page">
    <header className="portal-nav"><a className="brand" href="/"><div className="mark">A</div><div><strong>AURA</strong><small>INSTITUTE OF TECHNOLOGY</small></div></a><div><span>{user?.name}</span><button className="btn secondary" onClick={logout}>Sign out</button></div></header>
    <section className="portal-content">
      <div className="portal-intro"><span className="auth-kicker">{user?.role} PORTAL</span><h1>{user?.role === 'STUDENT' ? 'Your academic command center.' : user?.role === 'ADMIN' ? 'Admin command center.' : 'Faculty command center.'}</h1><p>{user?.role === 'STUDENT' ? 'Exams, grades, notices, events, placements and academic requests in one place.' : 'Admissions, cultural-event registrations, revaluation requests and academic operations from one place.'}</p></div>
      {user?.role === 'STUDENT' ? <Student data={data} events={events} placements={placements} revaluationSubjects={revaluationSubjects} timetable={timetable} /> : <Faculty apps={apps} revals={revals} events={events} notice={notice} setNotice={setNotice} publish={publish} isAdmin={user?.role === 'ADMIN'} placementAdmin={placementAdmin} studentsAdmin={studentsAdmin} studentPhotosAdmin={studentPhotosAdmin} revaluationSubjects={revaluationSubjects} timetable={timetable} />}
    </section>
  </main>
}

function Student({ data, events, placements, revaluationSubjects, timetable }: { data: any; events: EventItem[]; placements: PlacementItem[]; revaluationSubjects: RevaluationSubjectItem[]; timetable: TimetableItem[] }) {
  const [course, setCourse] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState('')
  const [registering, setRegistering] = useState('')
  const [eventMsg, setEventMsg] = useState<Record<string, string>>({})
  const [placementMsg, setPlacementMsg] = useState<Record<string, string>>({})

  async function submitRevaluation() {
    setMsg('')
    const r = await fetch('/api/student/revaluation', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ course: course || 'Revaluation', subjectId, reason }) })
    const d = await r.json()
    setMsg(r.ok ? 'Request submitted successfully.' : d.error || 'Request failed')
    if (r.ok) setReason('')
  }

  async function registerEvent(id: string) {
    setRegistering(id); setEventMsg(m => ({ ...m, [id]: '' }))
    const r = await fetch(`/api/events/${id}/register`, { method: 'POST' })
    const d = await r.json()
    setEventMsg(m => ({ ...m, [id]: r.ok ? 'Registered ✓' : d.error || 'Registration failed' }))
    setRegistering('')
  }

  async function applyPlacement(id: string) {
    setPlacementMsg(m => ({ ...m, [id]: 'Applying…' }))
    const r = await fetch(`/api/placements/${id}/apply`, { method: 'POST' })
    const d = await r.json()
    setPlacementMsg(m => ({ ...m, [id]: r.ok ? 'Application sent ✓' : d.error || 'Application failed' }))
    if (r.ok) {
      // Keep the page in sync without forcing a full reload.
      window.location.reload()
    }
  }

  const latestSgpa = data?.grades?.at(-1)?.sgpa

  return <div className="portal-grid">
    <div className="portal-card"><h3>Profile</h3><p><strong>{data?.user?.name}</strong><br/>{data?.user?.email}<br/><b>Student ID:</b> {data?.user?.studentId || 'Awaiting enrollment'}<br/><b>Department:</b> {data?.user?.department || 'Not assigned'}<br/><b>Phone:</b> {data?.user?.phone || 'Not provided'}<br/><b>Current semester:</b> {data?.currentSemester || 'Not recorded'}</p><div className="student-cgpa"><span>Current CGPA</span><strong>{data?.currentCgpa?.cgpa ?? '—'}</strong></div>{data?.user?.studentId && <StudentIdCard data={data} />}<StudentPhotoUpload data={data} /></div>
    <div className="portal-card"><h3>Admission application</h3>{data?.admission ? <><p><strong>{data.admission.applicationNo}</strong><br/>{data.admission.program}<br/>Route: {data.admission.admissionMode}<br/>Intake: {data.admission.intake}</p><div className="status-pill">{data.admission.status.replaceAll('_', ' ')}</div><AdmissionProgress status={data.admission.status} />{data?.user?.studentId && data.admission.status === 'ENROLLED' && <small className="enrollment-confirmed">Enrollment complete · Student ID {data.user.studentId}</small>}<small>Last updated: {new Date(data.admission.updatedAt || data.admission.createdAt).toLocaleString('en-IN')}</small></> : <p>No admission application is linked to this login email.</p>}</div>
    <div className="portal-card"><h3>Upcoming exams</h3>{(data?.exams || []).length ? data.exams.map((x: any) => <div className="portal-row" key={x._id}><strong>{x.subject}</strong><span>{x.time}<br/>{x.venue}</span></div>) : <p>No upcoming exams.</p>}</div>
    <div className="portal-card"><h3>Academic performance</h3><div className="big-number">{data?.currentCgpa?.cgpa ?? latestSgpa ?? '—'}</div><p>{data?.currentCgpa?.source === 'ADMIN' ? `Official CGPA · Semester ${data.currentCgpa.semester}` : 'Current CGPA calculated from recorded SGPAs'}</p>{(data?.cgpaHistory || []).length ? <div className="cgpa-history">{data.cgpaHistory.map((record:any) => <span key={record._id}>Sem {record.semester}: <b>{record.cgpa}</b></span>)}</div> : null}</div>
    <div className="portal-card"><h3>Revaluation request</h3><p className="muted">Choose an active subject and explain why you want the paper revalued.</p><select value={subjectId} onChange={e => { setSubjectId(e.target.value); const s = revaluationSubjects.find(x => x._id === e.target.value); setCourse(s ? `${s.name} (${s.code})` : '') }}><option value="">Select subject</option>{revaluationSubjects.filter(s => !data?.currentSemester || s.semester === data.currentSemester).map(s => <option key={s._id} value={s._id}>{s.name} ({s.code}) · Semester {s.semester}</option>)}</select><textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain the reason for your revaluation request"/><button className="btn primary" onClick={submitRevaluation} disabled={!subjectId || reason.trim().length < 10}>Submit request</button>{msg && <small>{msg}</small>}</div>
    <StudentTimetable timetable={timetable} semester={data?.currentSemester} />
    <div className="portal-card full"><h3>Cultural & campus events — registration</h3>{events.length ? events.map(event => <div className="application-row" key={event._id}><div><strong>{event.title}</strong><small>{new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {event.time || 'Time TBA'} · {event.venue || 'Venue TBA'}</small></div><div><button className="btn secondary" disabled={registering === event._id} onClick={() => registerEvent(event._id)}>{registering === event._id ? 'Registering…' : 'Register'}</button><small>{eventMsg[event._id] || `${event.registeredCount}/${event.capacity} seats`}</small></div></div>) : <p>No active events.</p>}</div>
    <div className="portal-card full"><h3>Placement Cell</h3><p className="muted">Apply only when you meet both the CGPA and semester criteria. Admin selection updates your status here.</p>{placements.length ? placements.map(p => <div className="placement-row" key={p._id}><div><strong>{p.companyName} — {p.jobRole}</strong><small>Salary: {p.salary} · Minimum CGPA: {p.minCgpa}</small><small>Eligible semesters: {p.eligibleSemesters?.length ? p.eligibleSemesters.join(', ') : 'All semesters'}</small><small>Skills: {p.skillsRequired?.join(', ') || 'As specified by recruiter'}</small>{p.applicationDeadline && <small>Deadline: {new Date(p.applicationDeadline).toLocaleDateString('en-IN')}</small>}{p.description && <p>{p.description}</p>}</div><div>{p.application ? <span className="status-pill">{p.application.status}</span> : <button className="btn secondary" disabled={p.eligibleByCgpa === false || p.eligibleBySemester === false} onClick={() => applyPlacement(p._id)}>{p.eligibleByCgpa === false ? `Need CGPA ${p.minCgpa}` : p.eligibleBySemester === false ? `Semester ${p.currentSemester || 'not set'} not eligible` : 'Apply'}</button>}{placementMsg[p._id] && <small>{placementMsg[p._id]}</small>}</div></div>) : <p>No placement opportunities are currently open.</p>}</div>
    <div className="portal-card full"><h3>Notifications <span className="notification-count">{(data?.notifications || []).filter((n:any) => !n.read).length || 0}</span></h3>{(data?.notifications || []).length ? data.notifications.map((n:any) => <div className="notice-item notification-item" key={n._id}><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString('en-IN')}</small></div>) : <p>No notifications.</p>}<button className="btn secondary" onClick={() => fetch('/api/student/notifications', { method: 'PATCH' })}>Mark all as read</button></div><div className="portal-card full"><h3>Academic notices</h3>{(data?.notices || []).length ? data.notices.map((n: any) => <div className="notice-item" key={n._id}><strong>{n.title}</strong><p>{n.body}</p></div>) : <p>No notices.</p>}</div>
  </div>
}

function Faculty({ apps, revals, events, notice, setNotice, publish, isAdmin, placementAdmin, studentsAdmin, studentPhotosAdmin, revaluationSubjects, timetable }: { apps: any[]; revals: any[]; events: EventItem[]; notice: string; setNotice: (x: string) => void; publish: () => void; isAdmin: boolean; placementAdmin: any; studentsAdmin: any; studentPhotosAdmin: any[]; revaluationSubjects: RevaluationSubjectItem[]; timetable: TimetableItem[] }) {
  const [localRevals, setLocalRevals] = useState(revals)
  return <div className="portal-grid">
    {isAdmin && <AdminDashboard apps={apps} events={events} placementAdmin={placementAdmin} studentsAdmin={studentsAdmin} />}
    <div className="portal-card full"><h3>Admissions queue</h3>{apps.length === 0 ? <p>No applications found.</p> : apps.map(a => <Application key={a._id} app={a} />)}</div>
    <div className="portal-card full"><h3>Cultural event registrations</h3>{events.length === 0 ? <p>No events found.</p> : events.map(event => <EventRegistrations key={event._id} event={event} />)}</div>
    {isAdmin && <CgpaManager initial={studentsAdmin} />}
    {isAdmin && <StudentPhotoVerification initial={studentPhotosAdmin} />}
    {isAdmin && <EventManager initial={events} />}
    {isAdmin && <RevaluationSubjectManager initial={revaluationSubjects} />}
    {isAdmin && <TimetableManager initial={timetable} />}
    <div className="portal-card full"><h3>Revaluation requests</h3>{localRevals.length === 0 ? <p>No revaluation requests.</p> : localRevals.map(r => <Revaluation key={r._id} item={r} onUpdated={(next) => setLocalRevals(items => items.map(x => x._id === next._id ? next : x))} />)}</div>
    {isAdmin && <PlacementManager initial={placementAdmin} />}
    <div className="portal-card full"><h3>Publish notice</h3><textarea value={notice} onChange={e => setNotice(e.target.value)} placeholder="Write a notice for students and staff"/><button className="btn primary" onClick={publish} disabled={!notice.trim()}>Publish notice →</button></div>
  </div>
}

function AdmissionProgress({ status }: { status: string }) {
  const steps = ['SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'ENROLLED']
  const index = steps.indexOf(status)
  return <div className="admission-progress">{steps.map((step, i) => <span className={i <= index ? 'done' : ''} key={step}><b>{i <= index ? '✓' : '○'}</b>{step.replaceAll('_', ' ')}</span>)}</div>
}

function StudentPhotoUpload({ data }: { data: any }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<string>(data?.user?.photoData || '')

  async function upload(file?: File) {
    if (!file) return
    setMessage('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setMessage('Use JPG, PNG or WebP.'); return }
    if (file.size > 5 * 1024 * 1024) { setMessage('Please choose an image below 5 MB.'); return }
    setBusy(true)
    try {
      const img = new Image()
      const source = URL.createObjectURL(file)
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Could not read image')); img.src = source })
      const max = 700
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(source)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not process image')), 'image/jpeg', 0.82))
      if (blob.size > 700 * 1024) { setMessage('Processed photo is still too large. Choose a simpler image.'); return }
      const form = new FormData(); form.append('photo', new File([blob], 'student-photo.jpg', { type: 'image/jpeg' }))
      const response = await fetch('/api/student/photo', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok) { setMessage(result.error || 'Upload failed.'); return }
      setPreview(URL.createObjectURL(blob))
      setMessage('Photo submitted ✓ Waiting for admin verification.')
      window.location.reload()
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed.') }
    finally { setBusy(false) }
  }

  const status = data?.user?.photoStatus || 'NONE'
  return <div className="photo-upload-box"><div className="photo-upload-head"><div><strong>Student photo</strong><small>Use a clear passport-style photo. Only an approved photo appears on the official ID.</small></div><span className={`photo-status ${status.toLowerCase()}`}>{status === 'NONE' ? 'NOT UPLOADED' : status}</span></div>{preview && <img className="photo-upload-preview" src={preview} alt="Student photo preview" />}{status === 'REJECTED' && <p className="photo-rejected">{data?.user?.photoRejectedReason || 'Photo was rejected. Please upload another photo.'}</p>}<label className="btn secondary photo-upload-button">{busy ? 'Processing…' : status === 'APPROVED' ? 'Replace photo' : 'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={e => upload(e.target.files?.[0])} /></label>{message && <small className="photo-upload-message">{message}</small>}</div>
}

function StudentIdCard({ data }: { data: any }) {
  const u = data.user
  const approvedPhoto = data?.user?.photoData || ''
  const verified = !!approvedPhoto
  const verifyUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${encodeURIComponent(u.studentId)}` : ''
  const qr = verifyUrl ? `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=180&margin=1` : ''

  async function download() {
    if (!verified || !qr) return
    const esc = (value: any) => String(value ?? '—').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c))
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Aura Student ID - ${esc(u.studentId)}</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#090b12;font-family:Arial,sans-serif}.card{width:900px;max-width:94vw;background:linear-gradient(135deg,#111827,#1e1b4b);color:white;border-radius:30px;padding:38px;box-shadow:0 25px 80px #0008}.top{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ffffff22;padding-bottom:22px}.brand{font-size:27px;font-weight:900;letter-spacing:.07em}.sub{font-size:11px;color:#a5b4fc;letter-spacing:.16em;margin-top:6px}.tag{font-size:12px;color:#86efac;font-weight:800}.body{display:flex;gap:30px;padding-top:28px}.photo{width:170px;height:205px;border-radius:20px;overflow:hidden;border:1px solid #ffffff33;background:#ffffff0d;flex:0 0 auto}.photo img{width:100%;height:100%;object-fit:cover}.info{flex:1}.name{font-size:34px;font-weight:900;margin-bottom:7px}.id{font-size:15px;color:#c4b5fd;letter-spacing:.12em}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px}.item{background:#ffffff0a;border:1px solid #ffffff12;border-radius:13px;padding:13px}.label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em}.value{margin-top:6px;font-weight:700}.qr{width:125px;height:125px;border-radius:14px;background:#fff;padding:8px;object-fit:contain}.qrbox{display:flex;align-items:center;gap:12px;margin-top:20px}.scan{font-size:10px;color:#a5b4fc;letter-spacing:.08em;text-transform:uppercase}.foot{margin-top:26px;padding-top:16px;border-top:1px solid #ffffff22;color:#94a3b8;font-size:11px;display:flex;justify-content:space-between;gap:20px}</style></head><body><div class="card"><div class="top"><div><div class="brand">AURA INSTITUTE OF TECHNOLOGY</div><div class="sub">DIGITAL STUDENT IDENTITY CARD</div></div><div class="tag">✓ VERIFIED STUDENT</div></div><div class="body"><div class="photo"><img src="${approvedPhoto}" alt="Student photo"></div><div class="info"><div class="name">${esc(u.name || 'Student')}</div><div class="id">${esc(u.studentId)}</div><div class="grid"><div class="item"><div class="label">Program</div><div class="value">${esc(data.admission?.program || u.department)}</div></div><div class="item"><div class="label">Semester</div><div class="value">${esc(data.currentSemester)}</div></div><div class="item"><div class="label">CGPA</div><div class="value">${esc(data.currentCgpa?.cgpa)}</div></div><div class="item"><div class="label">Academic year</div><div class="value">${esc(data.admission?.intake || new Date().getFullYear())}</div></div></div><div class="qrbox"><img class="qr" src="${qr}" alt="Verification QR"><div><b>SCAN TO VERIFY</b><div class="scan">Verify student identity online</div></div></div></div></div></div><div class="foot"><span>For campus identification and academic verification</span><span>Aura Institute of Technology</span></div></div></body></html>`
    const blob = new Blob([html], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `AURA-${u.studentId}-Student-ID.html`; a.click(); URL.revokeObjectURL(url)
  }
  return <div className="id-preview"><div className="id-photo-mini">{verified ? <img src={approvedPhoto} alt="Approved student" /> : <span>PHOTO<br/>PENDING</span>}</div><div><span className="id-brand">AURA INSTITUTE</span><small>DIGITAL STUDENT ID · {verified ? (data?.user?.photoStatus === 'PENDING' ? 'VERIFIED · NEW PHOTO PENDING' : 'VERIFIED') : 'PHOTO REQUIRED'}</small></div>{verified && qr && <img className="id-qr-mini" src={qr} alt="Verification QR" />}<button className="btn secondary" onClick={download} disabled={!verified || !qr}>{verified ? 'Download ID card' : 'Approve photo first'}</button></div>
}

function StudentPhotoVerification({ initial }: { initial: any[] }) {
  const [students, setStudents] = useState(initial)
  const [message, setMessage] = useState('')
  async function decide(userId: string, action: 'APPROVE' | 'REJECT') {
    let reason = ''
    if (action === 'REJECT') { reason = window.prompt('Reason for rejecting this photo:', 'Please upload a clear passport-style photo.') || ''; if (!reason.trim()) return }
    const response = await fetch('/api/admin/student-photos', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, action, reason }) })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Could not update photo.'); return }
    setStudents(items => items.filter(x => String(x._id) !== String(userId)))
    setMessage(action === 'APPROVE' ? 'Photo approved ✓' : 'Photo rejected ✓')
  }
  return <div className="portal-card full"><div className="photo-verification-head"><div><h3>Student Photo Verification</h3><p className="muted">Review photos submitted by students. Only approved photos appear on downloadable Student IDs and public QR verification.</p></div><span className="status-pill">{students.length} pending</span></div>{message && <small className="admin-feedback">{message}</small>}{students.length ? <div className="photo-verification-grid">{students.map(student => <div className="photo-review-card" key={student._id}><img src={student.pendingPhotoData} alt={`${student.name} pending photo`} /><div><strong>{student.name}</strong><small>{student.studentId || 'ID pending'} · {student.department || 'Department not assigned'}</small><small>{student.email}</small></div><div className="photo-review-actions"><button className="btn primary" onClick={() => decide(student._id, 'APPROVE')}>Approve</button><button className="btn secondary" onClick={() => decide(student._id, 'REJECT')}>Reject</button></div></div>)}</div> : <p className="muted">No student photos are waiting for verification.</p>}</div>
}


function EventManager({ initial }: { initial: EventItem[] }) {
  const blank = { title: '', date: '', time: '', venue: '', capacity: '100', description: '' }
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState('')
  const [events, setEvents] = useState(initial)
  const [message, setMessage] = useState('')

  function edit(event: EventItem) {
    setEditingId(event._id)
    setForm({
      title: event.title,
      date: new Date(event.date).toISOString().slice(0, 10),
      time: event.time || '',
      venue: event.venue || '',
      capacity: String(event.capacity || 100),
      description: event.description || '',
    })
    setMessage('')
  }

  function reset() { setEditingId(''); setForm(blank); setMessage('') }

  async function save(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    const payload = { ...form, date: form.date, capacity: Number(form.capacity) }
    const response = await fetch('/api/events', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
    })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Could not save event.'); return }
    setEvents(items => editingId ? items.map(x => x._id === editingId ? result.event : x) : [result.event, ...items])
    setMessage(editingId ? 'Event updated ✓' : 'Event created ✓')
    reset()
    window.location.reload()
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this event and its registrations?')) return
    const response = await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Could not delete event.'); return }
    setEvents(items => items.filter(x => x._id !== id))
    if (editingId === id) reset()
    setMessage('Event deleted ✓')
    window.location.reload()
  }

  return <div className="portal-card full">
    <div className="event-manager-heading"><div><h3>Event Management</h3><p className="muted">Admin-only event creation, editing and deletion. Student registrations remain visible below.</p></div><span className="status-pill">{events.length} events</span></div>
    <form className="placement-form" onSubmit={save}>
      <label>Event title<input value={form.title} onChange={e => setForm({...form, title:e.target.value})} required /></label>
      <label>Date<input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} required /></label>
      <label>Time<input value={form.time} onChange={e => setForm({...form, time:e.target.value})} placeholder="09:00 AM – 11:00 AM" /></label>
      <label>Venue<input value={form.venue} onChange={e => setForm({...form, venue:e.target.value})} placeholder="Innovation Hall" /></label>
      <label>Capacity<input type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity:e.target.value})} required /></label>
      <label className="full-field">Description<textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Short event description" /></label>
      <div className="admin-form-actions"><button className="btn primary">{editingId ? 'Update event →' : 'Add event →'}</button>{editingId && <button type="button" className="btn secondary" onClick={reset}>Cancel edit</button>}</div>
    </form>
    {message && <small className="admin-feedback">{message}</small>}
    <div className="admin-manage-list">{events.map(event => <div className="admin-manage-row" key={event._id}><div><strong>{event.title}</strong><small>{new Date(event.date).toLocaleDateString('en-IN')} · {event.time || 'Time TBA'} · {event.venue || 'Venue TBA'} · {event.registeredCount || 0}/{event.capacity} registered</small></div><div><button className="btn secondary" onClick={() => edit(event)}>Edit</button><button className="btn danger" onClick={() => remove(event._id)}>Delete</button></div></div>)}</div>
  </div>
}

function RevaluationSubjectManager({ initial }: { initial: RevaluationSubjectItem[] }) {
  const blank = { name: '', code: '', semester: '', active: true }
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState('')
  const [subjects, setSubjects] = useState(initial)
  const [message, setMessage] = useState('')

  function edit(subject: RevaluationSubjectItem) {
    setEditingId(subject._id)
    setForm({ name: subject.name, code: subject.code, semester: String(subject.semester), active: subject.active })
  }
  function reset() { setEditingId(''); setForm(blank) }

  async function save(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    const payload = { name: form.name, code: form.code, semester: Number(form.semester), active: form.active }
    const response = await fetch('/api/admin/revaluation-subjects', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
    })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Could not save subject.'); return }
    setSubjects(items => editingId ? items.map(x => x._id === editingId ? result.subject : x) : [...items, result.subject].sort((a,b) => a.semester-b.semester || a.name.localeCompare(b.name)))
    setMessage(editingId ? 'Subject updated ✓' : 'Subject added ✓')
    reset()
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this revaluation subject? Existing requests will remain in the system.')) return
    const response = await fetch(`/api/admin/revaluation-subjects?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Could not delete subject.'); return }
    setSubjects(items => items.filter(x => x._id !== id))
    if (editingId === id) reset()
    setMessage('Subject deleted ✓')
  }

  async function toggle(subject: RevaluationSubjectItem) {
    const response = await fetch('/api/admin/revaluation-subjects', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: subject._id, active: !subject.active }) })
    const result = await response.json()
    if (response.ok) setSubjects(items => items.map(x => x._id === subject._id ? result.subject : x))
    else setMessage(result.error || 'Could not change subject status.')
  }

  return <div className="portal-card full">
    <div className="event-manager-heading"><div><h3>Revaluation Subject Management</h3><p className="muted">Admin controls the subjects shown to students in the revaluation dropdown.</p></div><span className="status-pill">{subjects.filter(x => x.active).length} active</span></div>
    <form className="placement-form" onSubmit={save}>
      <label>Subject name<input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required /></label>
      <label>Subject code<input value={form.code} onChange={e => setForm({...form, code:e.target.value.toUpperCase()})} required /></label>
      <label>Semester<input type="number" min="1" max="20" value={form.semester} onChange={e => setForm({...form, semester:e.target.value})} required /></label>
      <label className="checkbox-field"><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active:e.target.checked})} /> Active for student applications</label>
      <div className="admin-form-actions"><button className="btn primary">{editingId ? 'Update subject →' : 'Add subject →'}</button>{editingId && <button type="button" className="btn secondary" onClick={reset}>Cancel edit</button>}</div>
    </form>
    {message && <small className="admin-feedback">{message}</small>}
    <div className="admin-manage-list">{subjects.map(subject => <div className="admin-manage-row" key={subject._id}><div><strong>{subject.name}</strong><small>{subject.code} · Semester {subject.semester}</small></div><div><span className="status-pill">{subject.active ? 'ACTIVE' : 'DISABLED'}</span><button className="btn secondary" onClick={() => toggle(subject)}>{subject.active ? 'Disable' : 'Enable'}</button><button className="btn secondary" onClick={() => edit(subject)}>Edit</button><button className="btn danger" onClick={() => remove(subject._id)}>Delete</button></div></div>)}</div>
  </div>
}

function TimetableManager({ initial }: { initial: TimetableItem[] }) {
  const blank = { subject: '', subjectCode: '', semester: '', examDate: '', startTime: '', endTime: '', examType: 'THEORY' as 'THEORY' | 'PRACTICAL', assessment: '1ST_INTERNAL' as TimetableItem['assessment'], venue: '' }
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState('')
  const [items, setItems] = useState(initial)
  const [message, setMessage] = useState('')
  const sorted = [...items].sort((a,b) => a.semester-b.semester || new Date(a.examDate).getTime()-new Date(b.examDate).getTime() || a.startTime.localeCompare(b.startTime))

  function edit(item: TimetableItem) {
    setEditingId(item._id)
    setForm({ subject:item.subject, subjectCode:item.subjectCode, semester:String(item.semester), examDate:new Date(item.examDate).toISOString().slice(0,10), startTime:item.startTime, endTime:item.endTime, examType:item.examType, assessment:item.assessment, venue:item.venue || '' })
  }
  function reset() { setEditingId(''); setForm(blank) }

  async function save(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    const payload = { ...form, semester:Number(form.semester), examDate:form.examDate }
    const response = await fetch('/api/admin/timetable', { method: editingId ? 'PATCH' : 'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(editingId ? {...payload,id:editingId}:payload) })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Could not save timetable entry.'); return }
    setItems(current => editingId ? current.map(x => x._id === editingId ? result.item : x) : [...current, result.item])
    setMessage(editingId ? 'Timetable entry updated ✓' : 'Timetable entry added ✓')
    reset()
  }
  async function remove(id:string) {
    if (!window.confirm('Delete this timetable entry?')) return
    const response = await fetch(`/api/admin/timetable?id=${encodeURIComponent(id)}`, {method:'DELETE'})
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Could not delete timetable entry.'); return }
    setItems(current => current.filter(x=>x._id!==id))
    setMessage('Timetable entry deleted ✓')
  }
  return <div className="portal-card full">
    <div className="event-manager-heading"><div><h3>Examination Timetable Management</h3><p className="muted">Admin-only control of subject, date, time, semester, exam type and assessment.</p></div><span className="status-pill">{items.length} entries</span></div>
    <form className="placement-form" onSubmit={save}>
      <label>Subject<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} required /></label>
      <label>Subject code<input value={form.subjectCode} onChange={e=>setForm({...form,subjectCode:e.target.value.toUpperCase()})} required /></label>
      <label>Semester<input type="number" min="1" max="20" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} required /></label>
      <label>Exam date<input type="date" value={form.examDate} onChange={e=>setForm({...form,examDate:e.target.value})} required /></label>
      <label>Start time<input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} required /></label>
      <label>End time<input type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} required /></label>
      <label>Exam type<select value={form.examType} onChange={e=>setForm({...form,examType:e.target.value as any})}><option value="THEORY">Theory</option><option value="PRACTICAL">Practical</option></select></label>
      <label>Examination<select value={form.assessment} onChange={e=>setForm({...form,assessment:e.target.value as any})}><option value="1ST_INTERNAL">1st Internal</option><option value="2ND_INTERNAL">2nd Internal</option><option value="3RD_INTERNAL">3rd Internal</option><option value="MAIN_EXAM">Main Examination</option></select></label>
      <label className="full-field">Venue<input value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} placeholder="Room / Lab" /></label>
      <div className="admin-form-actions"><button className="btn primary">{editingId ? 'Update timetable →' : 'Add timetable entry →'}</button>{editingId && <button type="button" className="btn secondary" onClick={reset}>Cancel edit</button>}</div>
    </form>
    {message && <small className="admin-feedback">{message}</small>}
    <div className="timetable-admin-list">{sorted.map(item => <div className="timetable-admin-row" key={item._id}><div><strong>{item.subject} <span className="muted">({item.subjectCode})</span></strong><small>Semester {item.semester} · {new Date(item.examDate).toLocaleDateString('en-IN')} · {item.startTime}–{item.endTime}</small><small>{item.examType} · {item.assessment.replaceAll('_',' ')}{item.venue ? ` · ${item.venue}` : ''}</small></div><div><button className="btn secondary" onClick={()=>edit(item)}>Edit</button><button className="btn danger" onClick={()=>remove(item._id)}>Delete</button></div></div>)}</div>
  </div>
}

function StudentTimetable({ timetable, semester }: { timetable: TimetableItem[]; semester?: number }) {
  function downloadPdf() {
    const rows = timetable.map(item => `<tr><td>${escapeHtml(item.subject)}</td><td>${escapeHtml(item.subjectCode)}</td><td>${new Date(item.examDate).toLocaleDateString('en-IN')}</td><td>${escapeHtml(item.startTime)} – ${escapeHtml(item.endTime)}</td><td>${item.examType}</td><td>${item.assessment.replaceAll('_',' ')}</td><td>${escapeHtml(item.venue || '—')}</td></tr>`).join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Aura Examination Timetable</title><style>@page{size:A4 landscape;margin:14mm}body{font-family:Arial,sans-serif;color:#111;margin:0}h1{margin:0 0 4px;color:#1e1b4b}h2{margin:0 0 16px;font-size:16px;color:#555}.meta{margin:16px 0;padding:12px;border:1px solid #ddd;border-radius:8px;background:#f7f7fb}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:9px;text-align:left;font-size:11px}th{background:#ecebff}.foot{margin-top:18px;font-size:10px;color:#666}@media print{.no-print{display:none}}</style></head><body><h1>AURA INSTITUTE OF TECHNOLOGY</h1><h2>Examination Timetable</h2><div class="meta"><b>Semester:</b> ${semester || '—'} &nbsp; <b>Generated:</b> ${new Date().toLocaleString('en-IN')}</div><table><thead><tr><th>Subject</th><th>Code</th><th>Date</th><th>Time</th><th>Type</th><th>Examination</th><th>Venue</th></tr></thead><tbody>${rows || '<tr><td colspan="7">No timetable entries available.</td></tr>'}</tbody></table><div class="foot">Aura Institute of Technology · Examination Cell</div><script>window.onload=function(){window.print()}</script></body></html>`
    const popup = window.open('', '_blank', 'width=1100,height=800')
    if (!popup) { window.alert('Please allow pop-ups to download the timetable as PDF.'); return }
    popup.document.write(html)
    popup.document.close()
  }
  return <div className="portal-card full student-timetable">
    <div className="event-manager-heading"><div><h3>Examination Timetable</h3><p className="muted">Your timetable is based on your current semester. Use Download PDF and choose “Save as PDF” in the print dialog.</p></div><span className="status-pill">Semester {semester || '—'}</span></div>
    {timetable.length ? <div className="timetable-table"><div className="timetable-head"><span>Subject</span><span>Date</span><span>Time</span><span>Type</span><span>Exam</span><span>Venue</span></div>{timetable.map(item => <div className="timetable-row" key={item._id}><strong>{item.subject}<small>{item.subjectCode}</small></strong><span>{new Date(item.examDate).toLocaleDateString('en-IN')}</span><span>{item.startTime}–{item.endTime}</span><span>{item.examType}</span><span>{item.assessment.replaceAll('_',' ')}</span><span>{item.venue || '—'}</span></div>)}</div> : <p className="muted">No timetable has been published for your semester yet.</p>}<button className="btn primary" onClick={downloadPdf} disabled={!timetable.length}>Download timetable PDF</button>
  </div>
}

function escapeHtml(value: any) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c))
}

function AdminDashboard({ apps, events, placementAdmin, studentsAdmin }: { apps: any[]; events: EventItem[]; placementAdmin: any; studentsAdmin: any }) {
  const placements = placementAdmin?.placements || []
  const applications = placementAdmin?.applications || []
  const selected = applications.filter((x:any) => x.status === 'SELECTED').length
  const shortlisted = applications.filter((x:any) => x.status === 'SHORTLISTED').length
  const audit = useState<any[]>([])
  useEffect(() => { fetch('/api/admin/audit', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => d && audit[1](d.logs || [])) }, [])
  const stats = [{ label:'Students', value:studentsAdmin?.students?.length || 0 }, { label:'Admissions', value:apps.length }, { label:'Companies', value:placements.length }, { label:'Event registrations', value:events.reduce((n,e)=>n+(e.registrations?.length||0),0) }, { label:'Placement applications', value:applications.length }, { label:'Shortlisted', value:shortlisted }, { label:'Selected', value:selected }]
  return <><div className="portal-card full admin-dashboard"><div className="dashboard-heading"><div><span className="auth-kicker">ADMIN OVERVIEW</span><h2>Everything important, at a glance.</h2></div></div><div className="stat-grid">{stats.map(s=><div className="stat-tile" key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div><div className="analytics-strip"><div><b>Placement conversion</b><span>{applications.length ? Math.round((selected/applications.length)*100) : 0}% selected</span></div><div><b>Active opportunities</b><span>{placements.filter((p:any)=>p.active !== false).length}</span></div><div><b>Pending admissions</b><span>{apps.filter((a:any)=>!['ENROLLED','REJECTED'].includes(a.status)).length}</span></div></div></div><div className="portal-card full"><h3>Admin activity log</h3>{audit[0].length ? audit[0].slice(0,10).map((x:any)=><div className="audit-row" key={x._id}><div><strong>{x.action}</strong><small>{x.actorId?.name || 'Admin'} · {x.entity}</small></div><span>{new Date(x.createdAt).toLocaleString('en-IN')}</span></div>) : <p className="muted">No audit activity recorded yet.</p>}</div></>
}

function downloadEventCsv(event: EventItem) {
  const rows = [['Student','Student ID','Email','Phone','Department / Program'], ...(event.registrations || []).map((r:any) => [r.userId?.name || 'Student',r.userId?.studentId || 'Not enrolled',r.userId?.email || 'Not provided',r.userId?.phone || 'Not provided',r.userId?.department || 'Not provided'])]
  const csv = rows.map(row => row.map((v:string) => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${event.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-registrations.csv`; a.click(); URL.revokeObjectURL(url)
}

function Application({ app }: { app: any }) {
  const [status, setStatus] = useState(app.status)
  const [notes, setNotes] = useState(app.notes || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  async function save() { setSaving(true); setMessage(''); const r = await fetch('/api/faculty/applications', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: app._id, status, notes }) }); setMessage(r.ok ? 'Saved ✓' : 'Save failed'); setSaving(false) }
  const academic = app.academicDetails || {}
  return <div className="admission-detail"><div className="admission-detail-head"><div><strong>{app.applicantName}</strong><small>{app.applicationNo} · Submitted {app.createdAt ? new Date(app.createdAt).toLocaleString('en-IN') : '—'}</small>{app.studentProfile && <small>Student ID: {app.studentProfile.studentId || 'Awaiting enrollment'} · {app.studentProfile.department || 'Department not assigned'}</small>}</div><div className="admission-actions"><select value={status} onChange={e => setStatus(e.target.value)}><option>SUBMITTED</option><option>UNDER_REVIEW</option><option>ASSESSMENT</option><option>INTERVIEW</option><option>OFFERED</option><option>ENROLLED</option><option>REJECTED</option></select><button className="btn secondary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div></div><div className="detail-grid"><span><b>Email</b>{app.email || '—'}</span><span><b>Phone</b>{app.phone || '—'}</span><span><b>Program</b>{app.program || '—'}</span><span><b>Intake</b>{app.intake || '—'}</span><span><b>Admission route</b>{app.admissionMode || '—'}</span><span><b>Residency</b>{app.residency || '—'}</span><span><b>Qualification</b>{academic.qualification || '—'}</span><span><b>Academic score</b>{academic.score || '—'}</span><span><b>School / College</b>{academic.school || '—'}</span><span><b>Year of passing</b>{academic.yearOfPassing || '—'}</span></div><label className="admin-notes"><b>Admin notes</b><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Interview notes, document checks, follow-up…"/></label>{app.documents?.length ? <div className="document-list"><b>Documents</b>{app.documents.map((d: any, i: number) => <span key={i}>{d.name || 'Document'}{d.url ? ` · ${d.url}` : ''}</span>)}</div> : null}{message && <small>{message}</small>}</div>
}

function EventRegistrations({ event }: { event: EventItem }) {
  return <div className="event-admin"><div className="event-admin-head"><div><strong>{event.title}</strong><small>{new Date(event.date).toLocaleDateString('en-IN')} · {event.time || 'Time TBA'} · {event.venue || 'Venue TBA'}</small></div><span><span className="status-pill">{event.registrations?.length || 0} registered / {event.capacity}</span>{event.registrations?.length ? <button className="btn secondary" onClick={() => downloadEventCsv(event)}>Export CSV</button> : null}</span></div>{event.registrations?.length ? <div className="registration-table"><div className="registration-head"><span>Student</span><span>Student ID</span><span>Email</span><span>Phone</span><span>Department / Program</span></div>{event.registrations.map((r: any) => <div className="registration-row" key={r._id}><strong>{r.userId?.name || 'Student'}</strong><span>{r.userId?.studentId || 'Not enrolled'}</span><span>{r.userId?.email || 'Not provided'}</span><span>{r.userId?.phone || 'Not provided'}</span><span>{r.userId?.department || 'Not provided'}</span></div>)}</div> : <p className="muted">No student registrations yet.</p>}</div>
}

function CgpaManager({ initial }: { initial: any }) {
  const [students, setStudents] = useState<any[]>(initial?.students || [])
  const [drafts, setDrafts] = useState<Record<string, { semester: string; cgpa: string }>>({})
  const [message, setMessage] = useState('')
  async function save(userId: string) {
    const draft = drafts[userId] || { semester: '', cgpa: '' }
    const r = await fetch('/api/faculty/students', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, semester: Number(draft.semester), cgpa: Number(draft.cgpa) }) })
    const d = await r.json()
    if (!r.ok) { setMessage(d.error || 'Could not save CGPA'); return }
    const refreshed = await fetch('/api/faculty/students', { cache: 'no-store' })
    if (refreshed.ok) setStudents((await refreshed.json()).students || [])
    setMessage('CGPA saved ✓')
  }
  async function remove(recordId: string) {
    const r = await fetch(`/api/faculty/students?id=${recordId}`, { method: 'DELETE' })
    if (r.ok) { setStudents(items => items.map(student => ({ ...student, cgpaRecords: (student.cgpaRecords || []).filter((record:any) => record._id !== recordId) }))); setMessage('CGPA record deleted ✓') }
  }
  return <div className="portal-card full"><h3>Student CGPA Management</h3><p className="muted">Admin control for every enrolled/student account. Add a CGPA for each semester, edit it later by saving the same semester again, or delete an incorrect record. The latest official CGPA is used for Placement Cell eligibility.</p>{message && <small className="admin-feedback">{message}</small>}{students.length ? students.map(student => { const draft = drafts[student._id] || { semester: '', cgpa: '' }; return <div className="student-admin-card" key={student._id}><div className="student-admin-head"><div><strong>{student.name}</strong><small>{student.studentId || 'Awaiting enrollment'} · {student.email}</small><small>{student.department || 'Department not assigned'} · {student.phone || 'Phone not provided'}</small></div><span className="status-pill">Current CGPA: {student.currentCgpa ?? '—'}</span></div><div className="cgpa-editor"><label>Semester<input type="number" min="1" max="20" value={draft.semester} onChange={e => setDrafts({...drafts, [student._id]: {...draft, semester:e.target.value}})} placeholder="1"/></label><label>CGPA<input type="number" min="0" max="10" step="0.01" value={draft.cgpa} onChange={e => setDrafts({...drafts, [student._id]: {...draft, cgpa:e.target.value}})} placeholder="8.50"/></label><button className="btn primary" onClick={() => save(student._id)} disabled={!draft.semester || !draft.cgpa}>Add / update CGPA</button></div>{student.cgpaRecords?.length ? <div className="cgpa-history admin-history">{student.cgpaRecords.map((record:any) => <div key={record._id}><span>Semester {record.semester}: <b>{record.cgpa}</b></span><button className="text-button" onClick={() => remove(record._id)}>Delete</button></div>)}</div> : <small className="muted">No admin-entered semester CGPA yet. Current value may be calculated from SGPA records.</small>}</div> }) : <p>No student accounts found.</p>}</div>
}

function PlacementManager({ initial }: { initial: any }) {
  const [placements, setPlacements] = useState<any[]>(initial?.placements || [])
  const [applications, setApplications] = useState<any[]>(initial?.applications || [])
  const [form, setForm] = useState({ companyName: '', jobRole: '', salary: '', skillsRequired: '', minCgpa: '7', eligibleSemesters: '', applicationDeadline: '', description: '' })
  const [message, setMessage] = useState('')

  async function createPlacement(e: FormEvent) {
    e.preventDefault(); setMessage('')
    const r = await fetch('/api/placements', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, minCgpa: Number(form.minCgpa), skillsRequired: form.skillsRequired.split(',').map(x => x.trim()).filter(Boolean), eligibleSemesters: form.eligibleSemesters.split(',').map(x => Number(x.trim())).filter(x => Number.isInteger(x) && x >= 1 && x <= 20) }) })
    const d = await r.json()
    if (!r.ok) { setMessage(d.error || 'Could not create placement'); return }
    setPlacements(items => [d.placement, ...items]); setForm({ companyName: '', jobRole: '', salary: '', skillsRequired: '', minCgpa: '7', eligibleSemesters: '', applicationDeadline: '', description: '' }); setMessage('Placement published ✓')
  }

  async function updateApplication(id: string, status: string) {
    const r = await fetch('/api/faculty/placements', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (r.ok) { const d = await r.json(); setApplications(items => items.map(x => x._id === id ? d.application : x)) }
  }

  return <div className="portal-card full"><h3>Placement Cell</h3><p className="muted">Create company opportunities here. Students see them in their portal, apply against the CGPA criterion, and their applications return to this panel for selection.</p><form className="placement-form" onSubmit={createPlacement}><label>Company name<input value={form.companyName} onChange={e => setForm({...form, companyName:e.target.value})} required/></label><label>Job role<input value={form.jobRole} onChange={e => setForm({...form, jobRole:e.target.value})} required/></label><label>Salary / CTC<input value={form.salary} onChange={e => setForm({...form, salary:e.target.value})} placeholder="₹12 LPA" required/></label><label>Minimum CGPA<input type="number" min="0" max="10" step="0.01" value={form.minCgpa} onChange={e => setForm({...form, minCgpa:e.target.value})} required/></label><label>Eligible semesters<input value={form.eligibleSemesters} onChange={e => setForm({...form, eligibleSemesters:e.target.value})} placeholder="6, 7, 8"/><small className="muted">Leave blank to allow every semester.</small></label><label>Skills required<input value={form.skillsRequired} onChange={e => setForm({...form, skillsRequired:e.target.value})} placeholder="Java, SQL, React, Python"/></label><label>Application deadline<input type="date" value={form.applicationDeadline} onChange={e => setForm({...form, applicationDeadline:e.target.value})}/></label><label className="full-field">Description<textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})}/></label><button className="btn primary">Publish placement →</button></form>{message && <small>{message}</small>}<div className="placement-admin-list"><h4>Open opportunities & applicant decisions</h4>{placements.length ? placements.map((p:any) => <div className="placement-admin-card" key={p._id}><div><strong>{p.companyName} — {p.jobRole}</strong><small>{p.salary} · Minimum CGPA {p.minCgpa} · Semesters: {p.eligibleSemesters?.length ? p.eligibleSemesters.join(', ') : 'All'} · {p.skillsRequired?.join(', ') || 'Skills not specified'}</small></div>{applications.filter(a => String(a.placementId?._id || a.placementId) === String(p._id)).length ? applications.filter(a => String(a.placementId?._id || a.placementId) === String(p._id)).map((a:any) => <div className="placement-applicant" key={a._id}><div><strong>{a.userId?.name || 'Student'}</strong><small>{a.userId?.studentId || 'ID pending'} · {a.userId?.email || '—'} · {a.userId?.department || '—'} · Current CGPA: {a.currentCgpa ?? '—'}</small></div><select value={a.status} onChange={e => updateApplication(a._id, e.target.value)}><option>APPLIED</option><option>SHORTLISTED</option><option>SELECTED</option><option>REJECTED</option></select></div>) : <p className="muted">No applications yet.</p>}</div>) : <p>No placement opportunities created yet.</p>}</div></div>
}

function Revaluation({ item, onUpdated }: { item: any; onUpdated: (item: any) => void }) {
  const student = item.userId
  async function update(status: string) { const r = await fetch('/api/faculty/revaluations', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item._id, status }) }); if (r.ok) onUpdated((await r.json()).request) }
  return <div className="application-row"><div><strong>{student?.name || 'Student'}</strong><small>{student?.studentId || student?.email || ''} · {item.course}</small><small>{item.reason}</small></div><div><span className="status-pill">{item.status}</span>{item.status === 'PENDING' && <><button className="btn secondary" onClick={() => update('APPROVED')}>Approve</button><button className="btn secondary" onClick={() => update('REJECTED')}>Reject</button></>}</div></div>
}

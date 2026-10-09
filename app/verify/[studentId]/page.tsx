import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Admission } from '@/models/Admission'
import { getCurrentCgpa, getCurrentSemester } from '@/lib/student-profile'

export const dynamic = 'force-dynamic'

export default async function VerifyStudent({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  await connectDB()
  const user = await User.findOne({ studentId, role: 'STUDENT', active: true }).select('name studentId department email photoData photoStatus').lean()
  if (!user || user.photoStatus !== 'APPROVED' || !user.photoData) notFound()
  const admission = await Admission.findOne({ email: user.email }).sort({ createdAt: -1 }).select('program intake status').lean()
  const [cgpa, semester] = await Promise.all([getCurrentCgpa(String(user._id)), getCurrentSemester(String(user._id))])
  return <main className="verify-page"><div className="verify-card"><div className="verify-head"><div><div className="verify-brand">AURA INSTITUTE OF TECHNOLOGY</div><div className="verify-sub">STUDENT ID VERIFICATION</div></div><span className="verify-badge">✓ VERIFIED</span></div><div className="verify-body"><img className="verify-photo" src={user.photoData} alt="Verified student"/><div className="verify-info"><h1>{user.name}</h1><div className="verify-id">{user.studentId}</div><div className="verify-grid"><div><small>PROGRAM</small><strong>{admission?.program || user.department || '—'}</strong></div><div><small>SEMESTER</small><strong>{semester ?? '—'}</strong></div><div><small>CGPA</small><strong>{cgpa.cgpa ?? '—'}</strong></div><div><small>ACADEMIC YEAR</small><strong>{admission?.intake || new Date().getFullYear()}</strong></div></div></div></div><div className="verify-foot"><span>Photo verified by Aura Institute of Technology</span><span>Student status: ACTIVE</span></div></div></main>
}

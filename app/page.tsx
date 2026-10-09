'use client'

import { useMemo, useState } from 'react'

const exams = [
  ['18', 'JUN', 'Data Structures', '09:30 – 12:30 · Main Hall'],
  ['21', 'JUN', 'Computer Networks', '09:30 – 12:30 · Main Hall'],
  ['24', 'JUN', 'AI & Machine Learning', '14:00 – 17:00 · Lab 3'],
]

const steps = [
  ['01', 'Submit application', 'Profile + academic details', 'Open'],
  ['02', 'Entrance assessment', 'Shortlisted applicants', 'Locked'],
  ['03', 'Faculty interaction', 'Portfolio + conversation', 'Locked'],
  ['04', 'Offer & onboarding', 'Secure your seat', 'Locked'],
]

function Icon({ children }: { children: string }) {
  return (
    <span className="icon" aria-hidden>
      {children}
    </span>
  )
}

function Button({
  children,
  primary = false,
  onClick,
}: {
  children: React.ReactNode
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={'btn ' + (primary ? 'primary' : 'secondary')}
    >
      {children}
    </button>
  )
}

export default function Home() {
  const [tour, setTour] = useState(false)
  const [portal, setPortal] = useState(false)
  const [program, setProgram] = useState('B.Tech Computer Science')
  const [mode, setMode] = useState('Hostel')
  const [year, setYear] = useState('2026')
  const [reason, setReason] = useState('')

  const fee = useMemo(
    () =>
      program.includes('Computer')
        ? mode === 'Hostel'
          ? 148000
          : 102000
        : program.includes('Design')
          ? mode === 'Hostel'
            ? 136000
            : 92000
          : mode === 'Hostel'
            ? 128000
            : 86000,
    [program, mode],
  )

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <div className="mark">A</div>
          <div>
            <strong>AURA</strong>
            <small>INSTITUTE OF TECHNOLOGY</small>
          </div>
        </div>

        <div className="menu">
          <button onClick={() => scroll('admissions')}>Admissions</button>
          <button onClick={() => scroll('academics')}>Academics</button>
          <button onClick={() => scroll('placements')}>
            Placements & Internships
          </button>
          <button onClick={() => scroll('campus')}>Campus Life</button>
          <button onClick={() => scroll('academics')}>Exams</button>
        </div>

        <div className="nav-actions">
          <div className="search">
            ⌕ <span>Search Aura</span>
            <kbd>⌘ K</kbd>
          </div>

          <Button primary onClick={() => setPortal(true)}>
            Student / Faculty Portal ↗
          </Button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <i /> BUILT FOR WHAT COMES NEXT
            <span>Admissions open · 2026</span>
          </div>

          <h1>Empowering Next-Gen Innovators & Leaders</h1>

          <p>
            Where bold ideas become real-world breakthroughs. Learn with
            purpose, build without limits, and join a campus that moves the
            future forward.
          </p>

          <div className="actions">
            <Button
              primary
              onClick={() => {
                window.location.href = '/apply'
              }}
            >
              Apply Now - Fall 2026 ↗
            </Button>

            <Button onClick={() => setTour(true)}>
              Take Virtual Campus Tour ▶
            </Button>
          </div>

          <div className="ticker">
            ↗ <b>98.4% Placement Record | 150+ Top Tier Recruiters</b>
            <i />
          </div>

          <div className="strengths">
            <div>
              <b>12</b>
              <span>Future-ready programs</span>
            </div>

            <div>
              <b>40+</b>
              <span>Student-led communities</span>
            </div>

            <div>
              <b>24/7</b>
              <span>Innovation, in motion</span>
            </div>
          </div>
        </div>

        <div className="campus-art" id="campus">
          <div className="campus-pill">
            ⌖ One campus. Infinite possibilities.
          </div>

          <div className="campus-drawer">
            <div className="drawer-title">
              ✦ Your campus, one click away
              <span>×</span>
            </div>

            <div className="quick">
              <button onClick={() => scroll('admissions')}>
                🎓
                <span>Apply to Aura</span>
              </button>

              <button onClick={() => scroll('academics')}>
                ▣
                <span>Exam timetable</span>
              </button>

              <button onClick={() => scroll('placements')}>
                ▰
                <span>Career center</span>
              </button>
            </div>

            <p>
              Fall 2026 applications close on 30 June. Make your next move.
            </p>
          </div>

          <div className="coords">
            <span>EXPLORE THE AURA EXPERIENCE</span>
            <span>EST. 2004 ↗</span>
          </div>
        </div>
      </section>

      <div className="disciplines">
        <span>ENGINEERING WITH PURPOSE</span>
        <b>COMPUTING & AI</b>
        <b>DESIGN & HUMANITIES</b>
        <b>BUSINESS & ENTREPRENEURSHIP</b>
        <b>SCIENCE & RESEARCH</b>
      </div>

      <section id="admissions" className="section">
        <Header
          eyebrow="ADMISSIONS HUB"
          title="A clear path from curiosity to campus."
          text="Everything you need to move from application to your first day at Aura."
          action="Admission guide"
        />

        <div className="steps">
          {steps.map(([n, t, d, s]) => (
            <article key={n}>
              <div className="step-top">
                <b>{n}</b>
                <span>{s === 'Open' ? '→' : '⌑'}</span>
              </div>

              <h3>{t}</h3>
              <p>{d}</p>
              <em>{s}</em>
            </article>
          ))}
        </div>

        <div className="admission-tools">
          <div className="fee">
            <div className="tool-head">
              <h3>▦ Tuition fee calculator</h3>
              <span>Live estimate</span>
            </div>

            <div className="fields">
              <label>
                Program
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                >
                  <option>B.Tech Computer Science</option>
                  <option>B.Des Product Design</option>
                  <option>BBA Innovation</option>
                </select>
              </label>

              <label>
                Residency
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option>Hostel</option>
                  <option>Day scholar</option>
                </select>
              </label>

              <label>
                Intake
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option>2026</option>
                  <option>2027</option>
                </select>
              </label>
            </div>

            <div className="fee-result">
              <div>
                <span>Estimated annual fee</span>
                <small>Includes academic and campus charges</small>
              </div>

              <strong>₹{fee.toLocaleString('en-IN')}</strong>

              <Button primary>Calculate =</Button>
            </div>
          </div>

          <div className="brochure">
            <span>▤ 2026–27</span>
            <h3>Aura prospectus</h3>
            <p>
              Programs, campus life, placements and the full admission
              roadmap.
            </p>

            <Button
              onClick={() => {
                window.location.href = '/apply'
              }}
            >
              Start application ↗
            </Button>
          </div>
        </div>
      </section>

      <section id="placements" className="section darker">
        <Header
          eyebrow="PLACEMENTS & INTERNSHIPS"
          title="Turn capability into momentum."
          text="Career outcomes backed by industry partnerships, internships and an active alumni network."
          action="Explore careers"
        />

        <div className="stats">
          <Stat
            label="Placement rate"
            value="98.4%"
            note="of eligible students placed"
          />

          <Stat
            label="Top package"
            value="₹42L"
            note="annual CTC · 2026"
          />

          <Stat
            label="Recruiters"
            value="150+"
            note="active hiring partners"
          />
        </div>

        <div className="career-grid">
          <div className="career-card">
            <span>INTERNSHIP PIPELINE</span>
            <h3>From classroom to real teams.</h3>

            <p>
              Live projects and internships across product, engineering,
              consulting and research.
            </p>

            <div className="company-row">
              <b>GOOGLE</b>
              <b>MICROSOFT</b>
              <b>ADOBE</b>
              <b>DELOITTE</b>
            </div>
          </div>

          <div className="career-card accent">
            <span>CAREER COMMAND CENTER</span>

            <h3>
              Track roles, mentors and interviews in one place.
            </h3>

            <Button
              primary
              onClick={() => {
                window.location.href = '/login'
              }}
            >
              Open career center ↗
            </Button>
          </div>
        </div>
      </section>

      <section className="section">
        <Header
          eyebrow="CAMPUS LIFE & EVENTS"
          title="A campus that keeps moving."
          text="Clubs, festivals, talks and experiences designed around the people who make Aura."
          action="View all events"
        />

        <div className="event-grid">
          <div className="event-list">
            <div className="event-line">
              <b>18 JUN</b>
              <span>
                <strong>Future Tech Summit</strong>
                <small>09:00 · Innovation Hall</small>
              </span>
            </div>

            <div className="event-line">
              <b>24 JUN</b>
              <span>
                <strong>Design Futures Night</strong>
                <small>18:30 · Studio Theatre</small>
              </span>
            </div>

            <div className="event-line">
              <b>02 JUL</b>
              <span>
                <strong>Aura Open Mic</strong>
                <small>19:00 · Student Plaza</small>
              </span>
            </div>

            <div className="lineup">
              <h4>Featured communities</h4>
              <p>Robotics Club</p>
              <p>AI Society</p>
              <p>Entrepreneurship Cell</p>
              <p>Creative Coding Lab</p>
            </div>
          </div>

          <div className="register">
            <Icon>🎟</Icon>

            <h3>Reserve your seat</h3>

            <p>
              Choose an upcoming event and we'll keep your pass ready.
            </p>

            <select>
              <option>Future Tech Summit</option>
              <option>Design Futures Night</option>
              <option>Aura Open Mic</option>
            </select>

            <Button
              primary
              onClick={() => {
                window.location.href = '/login'
              }}
            >
              Sign in to register →
            </Button>

            <small>
              No payment required · Student ID at entry
            </small>
          </div>
        </div>
      </section>

      <section id="academics" className="section">
        <Header
          eyebrow="EXAMINATION & ACADEMICS"
          title="Your academic command center."
          text="A focused view of exams, performance and academic requests."
          action="Open academic portal"
        />

        <div className="dashboard">
          <div className="dash-head">
            <div className="avatar">CK</div>

            <div>
              <strong>Good morning, Chandan</strong>
              <small>Computer Science · Semester 6</small>
            </div>

            <span>● All systems operational　♢</span>
          </div>

          <div className="widgets">
            <div className="widget exams">
              <h3>
                Upcoming exam schedule <span>▣</span>
              </h3>

              {exams.map((x) => (
                <div className="exam" key={x[0]}>
                  <b>
                    {x[0]}
                    <small>{x[1]}</small>
                  </b>

                  <span>
                    <strong>{x[2]}</strong>
                    <small>{x[3]}</small>
                  </span>
                </div>
              ))}

              <Button>Download timetable ↓</Button>
            </div>

            <div className="widget chart">
              <h3>
                SGPA trend <span>⌁</span>
              </h3>

              <div className="sgpa">
                <strong>8.7</strong>
                <span>+0.4 vs last semester</span>
              </div>

              <div className="chartbox">
                <div className="gridline g1" />
                <div className="gridline g2" />
                <div className="gridline g3" />

                <svg
                  viewBox="0 0 340 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M10 100 L115 72 L220 53 L330 25 L330 120 L10 120 Z"
                    fill="rgba(99,102,241,.16)"
                  />

                  <path
                    d="M10 100 L115 72 L220 53 L330 25"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              <small>
                Steady improvement across four semesters.
              </small>
            </div>

            <div className="widget reval">
              <h3>Revaluation request</h3>

              <p>
                Need a second review? Submit a request for an eligible
                paper.
              </p>

              <label>
                Course
                <select>
                  <option>Advanced Algorithms</option>
                  <option>Computer Networks</option>
                </select>
              </label>

              <label>
                Reason
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe your request"
                />
              </label>

              <Button
                primary
                onClick={() => {
                  window.location.href = '/login'
                }}
              >
                Open portal to submit →
              </Button>

              <small>
                Requests are reviewed within 5 working days.
              </small>
            </div>
          </div>

          <div className="notice">
            ⓘ
            <span>
              Academic notice: Semester 6 hall tickets are available from
              15 June.
            </span>
            <b>View notice →</b>
          </div>
        </div>
      </section>

      <footer>
        <div className="invite">
          <div>
            <h2>Ready to build what comes next?</h2>
            <p>Start your Aura journey today.</p>
          </div>

          <Button
            primary
            onClick={() => {
              window.location.href = '/apply'
            }}
          >
            Begin your application ↗
          </Button>
        </div>

        <div className="footer-grid">
          <div>
            <div className="brand">
              <div className="mark">A</div>

              <div>
                <strong>AURA</strong>
                <small>INSTITUTE OF TECHNOLOGY</small>
              </div>
            </div>

            <p>
              Education for people who want to shape what comes next.
            </p>

            <p>Innovation District · Bengaluru, India</p>

            <div>◎　in　▶</div>
          </div>

          {[
            [
              'Explore',
              'Admissions',
              'Academics',
              'Placements',
              'Campus Life',
              'Exams',
            ],
            [
              'Resources',
              'Prospectus',
              'Student portal',
              'Career center',
              'Events',
              'Contact',
            ],
            [
              'Institute',
              'About Aura',
              'Leadership',
              'Research',
              'Newsroom',
              'Visit campus',
            ],
          ].map(([h, ...links]) => (
            <div key={h}>
              <h4>{h}</h4>

              {links.map((x) => (
                <a key={x}>{x}</a>
              ))}
            </div>
          ))}
        </div>

        <div className="legal">
          <span>© 2026 Aura Institute of Technology</span>
          <span>
            Privacy　Terms　Accessibility　Policies
          </span>
        </div>
      </footer>

      {portal && (
        <Modal
          title="Aura portal"
          close={() => setPortal(false)}
        >
          <p>
            Portal authentication is ready to be connected to your
            production identity provider.
          </p>

          <Button
            primary
            onClick={() => {
              window.location.href = '/login'
            }}
          >
            Continue to portal
          </Button>
        </Modal>
      )}

      {tour && (
        <Modal
          title="Virtual campus tour"
          close={() => setTour(false)}
        >
          <div className="tour">
            <div>360°</div>

            <p>
              Interactive tour placeholder. Connect this view to your
              Figma prototype/video or campus panorama.
            </p>
          </div>
        </Modal>
      )}
    </main>
  )
}

function Header({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string
  title: string
  text: string
  action: string
}) {
  const route =
    action === 'Admission guide'
      ? '/apply'
      : action === 'Explore careers' ||
          action === 'Open academic portal'
        ? '/login'
        : '#campus'

  return (
    <div className="section-head">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

      <button onClick={() => (window.location.href = route)}>
        {action} ↗
      </button>
    </div>
  )
}

function Stat({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b>{value}</b>
      <small>{note}</small>
    </div>
  )
}

function Modal({
  title,
  close,
  children,
}: {
  title: string
  close: () => void
  children: React.ReactNode
}) {
  return (
    <div className="overlay" onClick={close}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={close}>
          ×
        </button>

        <span>PORTAL</span>
        <h2>{title}</h2>

        {children}
      </div>
    </div>
  )
}

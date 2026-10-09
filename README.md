
# 🎓 Aura Institute of Technology — Student ERP Portal

A full-stack college ERP and student management portal designed to provide
students, faculty, and administrators with a centralized platform for
academic, placement, event, examination, and student services.

## 🌐 About the Project

The Aura Institute of Technology ERP Portal is a web-based system that
digitizes important college activities and provides separate dashboards
for Students, Faculty, and Administrators.

The portal allows students to manage their academic and campus activities
from one place, while faculty and administrators can manage students,
events, placements, examinations, revaluation requests, timetables,
notifications, and other institutional activities.

---

## ✨ What Does the Portal Do?

### 👨‍🎓 Student Portal

Students can:

- 🔐 Securely log in to their portal
- 👤 View their student profile
- 🪪 Generate and view a digital Student ID card
- 📷 Upload a profile photo for ID verification
- 🔳 Verify their Student ID using a QR code
- 📊 View SGPA / CGPA and academic information
- 📚 View semester-wise academic history
- 📝 Submit examination revaluation requests
- 📅 View their examination timetable
- 📥 Download / print their timetable
- 🎉 View available college events
- 🎟️ Register for events
- 💼 View placement opportunities
- 📋 Apply for eligible placement opportunities
- 🔔 Receive notifications
- 📈 Track placement application status

---

### 👨‍🏫 Faculty Portal

Faculty members can:

- 👨‍🎓 View student information
- 📝 Review revaluation requests
- 🎉 View event registrations
- 💼 Manage / review placement applications
- 📢 Manage notices and notifications
- 📊 Access relevant academic information

---

### 🛡️ Admin Portal

Administrators have centralized control over the ERP.

#### 🎉 Event Management

Admins can:

- Add new events
- Edit existing events
- Delete events
- Set event date and time
- Set venue
- Set capacity
- Add event descriptions
- View student registrations

#### 📝 Revaluation Management

Admins can:

- Add revaluation subjects
- Edit subjects
- Enable / disable subjects
- Remove inactive subjects
- Define subject codes
- Assign subjects to semesters

Students automatically see the active subjects when submitting
a revaluation request.

#### 📅 Timetable Management

Admins can:

- Add timetable entries
- Edit timetable entries
- Delete timetable entries
- Specify subject and subject code
- Specify semester
- Set examination date
- Set start and end time
- Specify Theory / Practical
- Specify examination type
- Specify venue

Supported examination types include:

- 1st Internal
- 2nd Internal
- 3rd Internal
- Main Examination

#### 💼 Placement Management

Admins can manage:

- Companies
- Job roles
- Salary packages
- Required skills
- Minimum CGPA
- Eligible semesters
- Application deadlines
- Student applications
- Shortlisted students
- Selected / rejected students

#### 👤 Student Photo Verification

Admins can:

- View uploaded student photographs
- Approve photographs
- Reject photographs
- Provide rejection reasons

Only approved photographs are used for the digital Student ID.

#### 📊 Audit & Administration

The system also maintains administrative activity/audit information
for important operations.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     Aura Portal     │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
           👨‍🎓 Student     👨‍🏫 Faculty     🛡️ Admin
                │              │              │
                └──────────────┼──────────────┘
                               │
                         Next.js APIs
                               │
                         MongoDB Database
```

---

# 🛠️ Technologies Used

### Frontend

- Next.js
- React
- TypeScript
- CSS

### Backend

- Next.js API Routes
- Node.js
- MongoDB
- Mongoose

### Security

- Authentication
- Session management
- Role-based access
- API validation
- Rate limiting
- Security headers
- Audit logging

### Development Tools

- Git
- GitHub
- npm
- Docker

---

# 📂 Project Structure

```text
aura-institute-erp/
│
├── app/
│   ├── api/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── faculty/
│   │   ├── placements/
│   │   └── student/
│   │
│   ├── login/
│   ├── portal/
│   ├── verify/
│   └── apply/
│
├── lib/
│   ├── auth.ts
│   ├── mongodb.ts
│   ├── audit.ts
│   ├── validation.ts
│   └── rate-limit.ts
│
├── models/
│   ├── User.ts
│   ├── Event.ts
│   ├── Placement.ts
│   ├── Timetable.ts
│   ├── RevaluationSubject.ts
│   └── ...
│
├── scripts/
│
├── Dockerfile
├── package.json
├── next.config.ts
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/kmchandankumar69-dot/aura-institute-erp.git
cd aura-institute-erp
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=aura_institute
```

⚠️ Never commit `.env.local` to GitHub.

An example environment file is provided as:

```text
.env.example
```

## 4. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏭 Production Build

Run:

```bash
npm run typecheck
npm run build
```

For the standalone production server:

```bash
xcopy /E /I /Y .next\static .next\standalone\.next\static
node .next\standalone\server.js
```

---

# 🔐 Security

The project includes several security measures including:

- Role-based access control
- Authentication and sessions
- Input validation
- API-level authorization
- Rate limiting
- Security headers
- Audit logging
- Environment variable protection

Sensitive configuration such as MongoDB credentials is kept outside
the Git repository.

---

# 🎯 Main Modules

| Module | Student | Faculty | Admin |
|---|:---:|:---:|:---:|
| Authentication | ✅ | ✅ | ✅ |
| Student Profile | ✅ | 👁️ | ✅ |
| Digital Student ID | ✅ | 👁️ | ✅ |
| QR Verification | ✅ | 👁️ | ✅ |
| Academic Information | ✅ | 👁️ | ✅ |
| Revaluation | ✅ | ✅ | ✅ |
| Timetable | ✅ | 👁️ | ✅ |
| Events | ✅ | 👁️ | ✅ |
| Event Registration | ✅ | 👁️ | ✅ |
| Placements | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |
| Photo Verification | — | — | ✅ |
| Audit Logs | — | — | ✅ |

---

# 🎓 Project Objective

The main objective of the Aura Institute of Technology ERP Portal is to
provide a centralized digital platform that reduces manual college
administration and improves communication between students, faculty,
and administrators.

The system brings multiple student services into a single portal,
making academic and campus-related activities easier to manage,
track, and access.

---

# 👨‍💻 Project

**Aura Institute of Technology — ERP Portal**

Developed as a full-stack academic software project using modern web
technologies.

---

## 📄 License

This project is intended for academic and educational purposes.
```


If you want, I can also make it **more professional/portfolio-level**, with sections for **screenshots, features, database design, API modules, future enhancements, and project objectives**, so your GitHub repository looks like a proper final-year project rather than a code dump.

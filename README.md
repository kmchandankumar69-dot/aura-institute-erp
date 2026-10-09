# Aura Institute of Technology — production MongoDB app

Next.js App Router + TypeScript + MongoDB/Mongoose + server-side sessions + role-based portals.

## Production hardening included

- MongoDB connection pooling and automatic reconnect handling.
- Opaque, random, HTTP-only session cookies backed by MongoDB; sessions can be revoked server-side.
- `secure` + `SameSite=Lax` cookies in production.
- Password hashing with bcrypt (12 rounds).
- Zod validation for public and privileged APIs.
- Rate limiting for login, registration, admissions and revaluation using MongoDB TTL buckets.
- Atomic event-seat reservation to prevent overbooking under concurrent requests.
- Unique indexes for users, applications, grades, sessions, registrations and pending revaluation requests.
- Role checks for student/faculty/admin endpoints.
- Request-size limits on JSON mutation endpoints.
- Security headers and production HSTS/CSP.
- Health endpoint with MongoDB ping and `503` on database failure.
- Mongoose 9 `returnDocument: 'after'` APIs to avoid deprecated `new: true` warnings.
- Standalone Next.js production output and Dockerfile.
- No secrets committed; `.env.local` is ignored.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Put your MongoDB Atlas URI and a new random `AUTH_SECRET` in `.env.local`.
3. Use strong, unique seed passwords if you run the seed script.
4. Install dependencies:

```bash
npm ci
```

5. Seed development data once:

```bash
npm run seed
```

6. Ensure MongoDB indexes after schema changes:

```bash
npm run indexes
```

7. Start development:

```bash
npm run dev
```

8. Verify the production code path locally:

```bash
npm run check
npm run start
```

## Production environment

Required:

- `MONGODB_URI`
- `MONGODB_DB`
- `AUTH_SECRET` — use at least 32 random characters; preferably 64+.
- `NEXT_PUBLIC_APP_URL` — the HTTPS public URL.

Seed variables are only needed for the seed command and should not be present in the runtime environment unless you deliberately need them.

### Generate a secret

PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or use a trusted password/secret manager's random generator.

## Deploy with Docker

Build:

```bash
docker build -t aura-institute .
```

Run with your platform's secret/environment management:

```bash
docker run --rm -p 3000:3000 --env-file .env.production aura-institute
```

Do not bake `.env.production` into the image.

## Application routes

- `/` — public institute site
- `/apply` — admissions submission
- `/login` — student/faculty/admin authentication
- `/portal` — role-aware portal

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/admissions`
- `GET /api/admissions`
- `GET /api/events`
- `POST /api/events`
- `POST /api/events/:id/register`
- `GET /api/student/dashboard`
- `POST /api/student/revaluation`
- `GET/PATCH /api/faculty/revaluations`
- `PATCH /api/faculty/applications`
- `POST /api/faculty/notices`
- `GET /api/health`

## Before going public

- Rotate any MongoDB password or application secret that has ever been pasted into a chat, source file, screenshot or terminal recording.
- Restrict MongoDB Atlas Network Access to the deployment platform's outbound IPs where practical; avoid `0.0.0.0/0` for production.
- Use HTTPS and a real production domain.
- Put secrets in your hosting provider's secret manager.
- Enable MongoDB Atlas backups and alerts.
- Configure application error monitoring and centralized logs.
- Add a transactional email provider for admission confirmations/password recovery.
- Add an object-storage provider for admission documents rather than storing uploads on the application filesystem.
- Run database migrations/index checks as part of deployment.
- Back up before schema/index changes.
- Review faculty/admin accounts and disable unused accounts.

## Important

The seed script is for controlled setup/development data. Do not run it blindly against a production database containing real institutional records.

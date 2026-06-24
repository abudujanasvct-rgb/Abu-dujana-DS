# Abu Dujana — Engineering Portfolio

A full-stack, self-built portfolio site with a live MongoDB-backed project list,
a contact form, and a private admin dashboard secured with WebAuthn
(fingerprint / Face ID) plus a password fallback.

## Structure

```
/frontend   React + Vite site (Home, Projects, About, Contact, Admin)
/backend    Node + Express API (MongoDB via Mongoose, JWT auth, WebAuthn)
```

## Local setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and fill in your real MongoDB URI, JWT secret, etc.
node createAdmin.js you@example.com "a-strong-password"
npm start
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't running on localhost:5000
npm run dev
```

## Deployment

- **Frontend** → Vercel (free)
- **Backend** → Render (free)
- **Database** → MongoDB Atlas M0 (free forever)

See deployment notes from Claude for the exact steps used for this project.

## Security notes

- Passwords are hashed with bcrypt (cost factor 12)
- Biometric login uses the WebAuthn standard (same tech as Face ID / Touch ID on banking apps)
- JWT sessions expire after 12 hours
- Login attempts are rate-limited; accounts lock for 15 minutes after 5 failed attempts
- CORS is locked to specific allowed origins in production
- All admin-only routes require a valid signed JWT

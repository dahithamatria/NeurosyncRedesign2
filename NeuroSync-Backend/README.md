# NeuroSync Backend

A real Node.js + Express + PostgreSQL (via Prisma) API for the NeuroSync
reading-screening app, built to match what the **actual** redesigned
frontend (`NeurosyncRedesign1-main.zip`) needs — not a generic template.

## 1. What this replaces

The frontend currently keeps everything in `localStorage`:

| Frontend behavior (current) | localStorage key | Replaced by |
|---|---|---|
| Signup.jsx pushes a user record | `neurosync_users` | `POST /api/auth/register` |
| Login.jsx checks email+password | `neurosync_users` | `POST /api/auth/login` |
| "current user" session | `neurosync_current_user` | JWT returned from login, decoded via `GET /api/auth/me` |
| PreferencesContext (dark mode, dyslexic font, font size) | `neurosync_dark_mode`, `neurosync_font`, `neurosync_font_size` | `GET/PUT /api/settings` |
| Personalize.jsx intake form | `neurosync_profile_<email>` | `GET/PUT /api/personalization` |
| Result.jsx → `saveAssessmentToHistory` | `neurosync_history_<email>` | `POST /api/assessments` |
| Dashboard.jsx → `getAssessmentHistory` | `neurosync_history_<email>` | `GET /api/assessments`, `GET /api/dashboard` |
| Result.jsx / ExtensionRecommendation.jsx → `utils/recommendation.js` | (client-side function) | `GET /api/recommendations?percent=` (same thresholds, server-verified) |

**What stays exactly as-is:** the assessment content itself. The paragraphs,
questions, word-recognition/spelling/vocabulary datasets
(`src/data/*.js`), the assessment builder (`utils/buildAssessment.js`), and
the scoring logic (`utils/scoring.js`) are a working, entirely client-side,
rule-based engine — per the brief, that was **not** moved to the backend.
The backend only stores the *finished result* of a completed assessment,
and independently re-derives the tier/support-level/recommended-extension
from `totalPercent` server-side (via `src/utils/recommendation.js`) so a
client can't spoof a higher score by editing the request.

The three Chrome extensions (`chrome-extension-basic/plus/smart`) also do
their own local, rule-based simplification — this backend does not touch or
replace that logic either.

There is currently no AI-simplify/AI-summarize button anywhere in the
redesigned frontend, so `/api/ai/simplify` and `/api/ai/summarize` are
scaffolded (see §8) but not wired into any UI yet.

## 2. Stack

- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT auth, bcrypt password hashing
- zod for request validation
- helmet, cors, express-rate-limit

## 3. Project structure

```
NeuroSync-Backend/
├── src/
│   ├── app.js                # express app, middleware, route mounting
│   ├── config/db.js          # Prisma client singleton
│   ├── controllers/          # one file per resource
│   ├── routes/                # one file per resource, mounted in app.js
│   ├── services/              # authService.js, aiService.js
│   ├── middleware/            # auth.js, validate.js, errorHandler.js
│   └── utils/                 # apiResponse.js, asyncHandler.js, recommendation.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── tests/
│   └── auth.test.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── API.md
└── server.js
```

## 4. Requirements

- Node.js 18+
- A running PostgreSQL instance (local install, Docker, or a hosted one
  like Supabase/Neon/Railway)

## 5. Install & configure

```bash
cd NeuroSync-Backend
npm install
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/neurosync"
JWT_SECRET="generate-a-long-random-string-here"
FRONTEND_URL="http://localhost:5173"
```

Don't have Postgres installed? Fastest path with Docker:

```bash
docker run --name neurosync-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=neurosync -p 5432:5432 -d postgres:16
```

Then `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neurosync"`.

## 6. Database setup

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

The seed script creates one clearly-labeled demo account:

```
email:    demo@neurosync.app
password: demo1234
```

with two demo assessment results so the Dashboard chart isn't empty on
first login. Nothing about this data is presented as real usage analytics.

## 7. Run it

```bash
npm run dev      # nodemon, auto-restarts on file changes
# or
npm start        # plain node
```

Server listens on `http://localhost:5000` by default. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

Run the smoke tests (needs the DB from step 6 running):

```bash
npm test
```

## 8. AI configuration (optional, not yet used by any UI)

`.env` has:

```
AI_API_KEY=""
AI_MODEL=""
```

Leave these blank and `/api/ai/simplify` / `/api/ai/summarize` fall back to
a clearly-labeled dev stub (see `src/services/aiService.js`) — the app
still runs fine without them. To wire up a real provider, fill in the
`callProvider()` function in that file and set the two env vars. No key is
ever hard-coded or sent to the frontend.

## 9. Connecting the React frontend

In `react-app/`, add a `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

A ready-to-use `src/services/api.js` (fetch wrapper that attaches the JWT
and unwraps `{ success, data }`) is included in this ZIP under
`frontend-integration/services/api.js` — copy it into
`react-app/src/services/api.js`. See `frontend-integration/README.md` in
this same ZIP for the specific before/after diffs needed in
`Login.jsx`, `Signup.jsx`, `Result.jsx`, `Dashboard.jsx`, and
`PreferencesContext.jsx` to call these endpoints instead of `localStorage`.

Make sure the backend's `FRONTEND_URL` in `.env` matches whatever port Vite
actually uses (default `5173`; check your terminal output when you run
`npm run dev` in `react-app/`).

## 10. Production notes

- Set `NODE_ENV=production` and a strong, unique `JWT_SECRET`.
- `FRONTEND_URL` should be your deployed frontend's real origin — CORS is
  locked to a single origin, not a wildcard.
- Run `npx prisma migrate deploy` (not `migrate dev`) in production.
- Put this behind HTTPS (via your host/reverse proxy) — JWTs in an
  `Authorization` header are only as safe as the transport.
- The forgot-password endpoint currently returns the raw reset token in
  the response body when `NODE_ENV !== 'production'`, purely so the flow
  is testable without an email provider. Wire up real email sending
  (e.g. Resend, SendGrid, SES) before shipping — the TODO is marked in
  `src/controllers/authController.js`.

## 11. Known limitations

- No email provider is configured, so password reset emails aren't
  actually sent — see §10.
- No refresh-token rotation; JWTs are long-lived (`JWT_EXPIRES_IN`, default
  7 days) and stateless logout just means "the client throws the token
  away." Fine for a college project, not for a bank.
- AI endpoints are scaffolded but not connected to a provider or to any
  frontend button (see §8).

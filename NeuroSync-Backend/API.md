# NeuroSync API Reference

Base URL: `http://localhost:5000/api`

All responses follow:

```json
{ "success": true, "data": { ... } }
```
or
```json
{ "success": false, "message": "..." }
```

Authenticated routes require:
```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/register
Auth: none

Request:
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "password123" }
```
Response `201`:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "Ada Lovelace", "email": "ada@example.com", "createdAt": "...", "updatedAt": "..." }
  }
}
```
Errors: `409` if the email is already registered, `422` on validation failure (matches Signup.jsx's own rules: name required, valid email, password ≥ 6 chars).

### POST /auth/login
Auth: none

Request:
```json
{ "email": "ada@example.com", "password": "password123" }
```
Response `200`: same shape as register.
Errors: `401 "Incorrect email or password. Please try again."` — deliberately identical whether the email doesn't exist or the password is wrong.

### POST /auth/logout
Auth: required

Response `200`:
```json
{ "success": true, "data": { "message": "Logged out. Discard the token on the client." } }
```

### GET /auth/me
Auth: required

Response `200`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...", "name": "...", "email": "...",
      "settings": { "darkMode": false, "dyslexicFont": false, "fontSize": "medium", ... },
      "personalization": { "age": 24, "gender": "...", ... } 
    }
  }
}
```

### POST /auth/forgot-password
Auth: none

Request: `{ "email": "ada@example.com" }`
Response `200` (always the same message, to avoid leaking which emails are registered):
```json
{ "success": true, "data": { "message": "If an account with that email exists, a reset link has been sent." } }
```
In non-production environments, a `devResetToken` field is also included so you can test the flow without an email provider.

### POST /auth/reset-password
Auth: none

Request: `{ "token": "<raw token from forgot-password>", "password": "newpassword123" }`
Response `200`: `{ "success": true, "data": { "message": "Password updated. You can now log in." } }`
Errors: `400` if the token is invalid or expired (tokens expire after 1 hour).

---

## Settings
Maps to `PreferencesContext.jsx` + a Settings screen.

### GET /settings
Auth: required
Response `200`:
```json
{ "success": true, "data": { "settings": {
  "darkMode": false, "dyslexicFont": false, "fontSize": "medium",
  "lineSpacing": "normal", "letterSpacing": "normal",
  "highContrast": false, "reduceMotion": false, "readingRuler": false
} } }
```

### PUT /settings
Auth: required

Request (any subset of fields):
```json
{ "darkMode": true, "fontSize": "large" }
```
Response `200`: full updated settings object, same shape as GET.

---

## Personalization
Maps to `Personalize.jsx`.

### GET /personalization
Auth: required
Response `200`: `{ "success": true, "data": { "profile": null } }` if not yet filled out, otherwise the stored profile.

### PUT /personalization
Auth: required

Request:
```json
{
  "age": 22,
  "gender": "Female",
  "education": "Undergraduate",
  "nativeLanguage": "English",
  "readingFrequency": "Daily",
  "glasses": "Yes",
  "diagnosedDyslexia": "No"
}
```
Response `200`: the saved profile.

---

## Assessments
Maps to `Result.jsx` (save) and `Dashboard.jsx` (read history). The
assessment content/scoring itself stays client-side; this only persists
the finished result.

### POST /assessments
Auth: required

Request:
```json
{
  "totalCorrect": 8,
  "totalScored": 10,
  "totalPercent": 80,
  "categoryScores": {
    "Vocabulary": { "correct": 4, "total": 5, "percent": 80 },
    "Word Recognition": { "correct": 4, "total": 5, "percent": 80 }
  },
  "readingSpeed": 165,
  "timeTakenSeconds": 220
}
```
Response `201`: the created assessment, including server-derived `tier`, `supportLevel`, and `recommendedExtension` (recomputed from `totalPercent`, not trusted from the request).

### GET /assessments
Auth: required
Response `200`: `{ "assessments": [ ... ] }`, oldest first (same order the Dashboard chart expects).

### GET /assessments/:id
Auth: required
Response `200`: single assessment. `404` if it doesn't belong to the caller.

---

## Dashboard
### GET /dashboard
Auth: required

Response `200` (no history yet):
```json
{ "success": true, "data": {
  "hasHistory": false, "assessmentsTaken": 0, "latest": null,
  "averageReadingSpeed": 0, "recommendedExtension": null,
  "chartData": [], "history": []
} }
```
Response `200` (with history):
```json
{ "success": true, "data": {
  "hasHistory": true,
  "assessmentsTaken": 2,
  "latest": { "totalPercent": 80, "tier": "Level 3", ... },
  "averageReadingSpeed": 158,
  "recommendedExtension": { "id": "easyread-smart", "name": "EasyRead Smart", "supportLevel": "Light Reading Assistance" },
  "chartData": [ { "date": "2026-08-20T...", "totalPercent": 60 }, { "date": "2026-08-27T...", "totalPercent": 80 } ],
  "history": [ /* newest first */ ]
} }
```

---

## Recommendations
Mirrors `utils/recommendation.js` on the frontend, server-verified.

### GET /recommendations?percent=80
Auth: required
Response `200`:
```json
{ "success": true, "data": {
  "tier": "Level 3", "level": "Light Reading Assistance",
  "extension": { "id": "easyread-smart", "name": "EasyRead Smart", "supportLevel": "Light Reading Assistance" }
} }
```

### GET /recommendations/extensions
Auth: required
Response `200`: the full Basic/Plus/Smart mapping.

---

## AI (scaffolded, not yet used by the frontend UI)

### POST /ai/simplify
Auth: required

Request: `{ "text": "...", "level": "plus" }`
Response `200` without `AI_API_KEY` configured:
```json
{ "success": true, "data": {
  "original": "...", "level": "plus", "simplified": "...same text...",
  "note": "AI_API_KEY is not set — returning the original text unchanged (dev fallback)."
} }
```

### POST /ai/summarize
Auth: required

Request: `{ "text": "..." }`
Response `200` without `AI_API_KEY` configured: naive first-sentence summary, with the same kind of `note` explaining the fallback.

---

## Health check
### GET /health
Auth: none
Response `200`: `{ "success": true, "data": { "status": "ok", "time": "..." } }`

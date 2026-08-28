# Wiring the backend into react-app

1. Copy `services/api.js` from this folder into `react-app/src/services/api.js`.
2. In `react-app/`, create `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
3. Apply the changes below. Each one replaces a `localStorage`-based check
   with a real API call, keeping the same component behavior.

## Login.jsx

Replace the body of `handleSubmit`:

```jsx
import { api, setToken } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const { token, user } = await api.login(form.email, form.password);
    setToken(token);
    localStorage.setItem('neurosync_current_user', JSON.stringify(user));

    const { profile } = await api.getPersonalization();
    navigate(profile ? '/assessment' : '/personalize');
  } catch (err) {
    setError(err.message);
  }
};
```

## Signup.jsx

Replace the body of `handleSubmit` (keep the existing client-side `validate()` call for instant field feedback):

```jsx
import { api, setToken } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  setErrors(errs);
  if (Object.keys(errs).length > 0) return;

  try {
    const { token, user } = await api.register(form.name, form.email, form.password);
    setToken(token);
    localStorage.setItem('neurosync_current_user', JSON.stringify(user));
    navigate('/personalize');
  } catch (err) {
    setErrors({ email: err.message });
  }
};
```

Note: the frontend's own duplicate-email check (reading `neurosync_users`)
can be deleted from `validate()` — the backend now returns a `409` for that
case, caught above.

## Personalize.jsx

Replace the `localStorage.setItem('neurosync_profile_...')` line:

```jsx
import { api } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  // ...existing required-field check...
  try {
    await api.updatePersonalization(profile);
    navigate('/assessment');
  } catch (err) {
    setError(err.message);
  }
};
```

## Result.jsx

Replace the `saveAssessmentToHistory(...)` call inside the `useEffect`:

```jsx
import { api } from '../services/api';

useEffect(() => {
  if (!state?.results) {
    navigate('/assessment', { replace: true });
    return;
  }
  api.createAssessment({
    totalCorrect: state.results.totalCorrect,
    totalScored: state.results.totalScored,
    totalPercent: state.results.totalPercent,
    categoryScores: state.results.categoryScores,
    readingSpeed: state.results.readingSpeed,
    timeTakenSeconds: Math.round((state.timeTakenMs || 0) / 1000),
  }).catch((err) => console.error('Failed to save assessment:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state]);
```

(`utils/history.js` can stay in the codebase unused, or be deleted once
you've confirmed the API call works end to end.)

## Dashboard.jsx

Replace the `getAssessmentHistory(...)` call and the derived stats with one
call to the new aggregation endpoint:

```jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setDashboard).catch(console.error);
  }, []);

  if (!dashboard) return null; // or a loading spinner

  const { hasHistory, assessmentsTaken, latest, averageReadingSpeed, recommendedExtension, history } = dashboard;
  // ...render exactly as before, using these instead of the localStorage-derived values
}
```

The chart's `history.map(...)` block can stay as-is — the shape
(`totalPercent`, `date`) is the same.

## PreferencesContext.jsx (optional)

The current version already works fine offline via `localStorage`. To sync
preferences across devices, load them from `GET /api/settings` on mount
(after login) and call `PUT /api/settings` inside each existing `useEffect`
alongside the current `localStorage.setItem` calls — keeping localStorage
as an instant-apply cache and the backend as the source of truth.

## RequireAuth (App.jsx)

Currently checks `localStorage.getItem('neurosync_current_user')`. That
still works as-is since Login/Signup above continue to set that key — no
change required unless you want to also validate the JWT hasn't expired,
in which case call `api.me()` and redirect to `/login` on failure.

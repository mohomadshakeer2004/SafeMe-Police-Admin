# SafeMe Admin

Police/admin dashboard for the SafeMe platform. Static HTML/CSS/JS with **Firebase Authentication** and **Realtime Database**.

## Stack (updated)

| Component | Version |
|-----------|---------|
| Firebase JS SDK | **12.14.0** (compat CDN) |
| jQuery | **3.7.1** (CDN on form/alert pages) |
| SweetAlert2 | **11.17.2** |
| Bootstrap | **5.0.1** (`assets/js/bootstrap.bundle.min.js`) |

Firebase compat keeps the existing `firebase.auth()` / `firebase.database()` API so app logic did not need a full modular rewrite.

## Run locally

```bash
# Option 1 — Python
python3 -m http.server 8080

# Option 2 — npm
npm install
npm start
```

Open [http://localhost:8080/index.html](http://localhost:8080/index.html).

Do not open HTML files via `file://`; Firebase and maps work better over HTTP.

### Google Maps

If the console shows **`ApiNotActivatedMapError`**, enable **Maps JavaScript API** for your key in Google Cloud Console. See [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md).

## Login

Uses the **same Firebase project as the mobile app** (`safe-a67e3`). See [FIREBASE_ADMIN_SETUP.md](FIREBASE_ADMIN_SETUP.md).

| Email | Password |
|-------|----------|
| `admin@safeme.app` | `SafeMe123` |

Create this user under Firebase Console → **safe-a67e3** → **Authentication** if missing.

If login fails with **referer blocked**, add your dev URL as an HTTP referrer on the Firebase browser API key — see [FIREBASE_ADMIN_SETUP.md](FIREBASE_ADMIN_SETUP.md#4-allow-localhost-fix-authrequests-from-referer--are-blocked).

Config: `firebase-JS/firebase.js` (must match `SafeMe/lib/firebase_options.dart`).

## Project layout

- `index.html` — login
- `dashboard.html` — main dashboard
- `firebase-JS/` — Firebase logic per feature
- `includes/firebase-sdk.html` — canonical Firebase `<script>` tags (copy into new pages)
- `includes/vendor-head.html` — jQuery + SweetAlert2 for pages that need alerts in `<head>`

## Future upgrade (optional)

For long-term maintenance, migrate from **compat** to the [modular Firebase API](https://firebase.google.com/docs/web/modular-upgrade) (`import { getAuth } from 'firebase/auth'`, etc.) and consider Firestore if Realtime Database is deprecated for your use case.

## Security

Do not commit production secrets. Move hardcoded passwords out of the client, tighten Firebase Security Rules, and rotate API keys if this repo is public.

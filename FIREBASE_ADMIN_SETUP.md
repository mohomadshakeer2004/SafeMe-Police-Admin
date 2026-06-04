# Admin panel ↔ mobile app Firebase alignment

The admin web panel and the SafeMe Flutter app must use the **same Firebase project**.

| App | Project ID | Realtime Database |
|-----|------------|-------------------|
| Mobile (`SafeMe/`) | **safe-a67e3** | `https://safe-a67e3-default-rtdb.firebaseio.com` |
| Admin (this repo) | **safe-a67e3** | (same) |

Previously the admin pointed at **safeme-50a06**, so it could not see data written by the mobile app.

## 1. Enable Authentication (safe-a67e3)

1. [Firebase Console](https://console.firebase.google.com/) → **safe-a67e3**
2. **Build** → **Authentication** → **Get started**
3. Enable **Email/Password**

## 2. Create admin login user

**Authentication** → **Users** → **Add user**:

- Email: `admin@safeme.app`
- Password: `SafeMe123`

This is the same account the mobile app uses for RTDB access (`firebase_service.dart`).

## 3. Realtime Database rules

Mobile app docs use:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

The admin panel must be **signed in** (same as mobile) to read/write.

## 4. Fix localhost login (`auth/requests-from-referer-...-are-blocked`)

Pick **one** option.

### Option A — Allow localhost on API key (simplest)

### Option B — Local auth proxy (no Google Cloud change)

1. Firebase Console → **safe-a67e3** → **Project settings** → **Service accounts** → **Generate new private key**
2. Save the JSON as `firebase-service-account.json` in the admin project root (gitignored)
3. In two terminals:

```bash
npm install
npm run auth-proxy    # keeps running on http://127.0.0.1:8787
npm start             # http://localhost:8080
```

4. Log in on `index.html` — when the browser key blocks referrers, login uses the proxy automatically.

---

### Admin browser API key (safe-a67e3)

The admin panel uses a **dedicated web API key** in `firebase-JS/firebase-config.js` (not the mobile Android key).

**Recommended restrictions in Google Cloud:**

| Setting | Value |
|---------|--------|
| Application restrictions | HTTP referrers: `http://localhost:8080/*`, `http://127.0.0.1:8080/*`, your production admin URL |
| API restrictions | Identity Toolkit API, Firebase Installations API (or Firebase-related APIs only) |

Do not commit service account JSON or rotate keys if this repo is public.

### Option A details — API key referrers

If login shows **requests from referer … are blocked**, the **Firebase Web API key** has HTTP referrer restrictions that omit your dev URL.

Admin uses this key (from `firebase-JS/firebase.js`):

- **API key (admin web):** `AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE` — set in `firebase-JS/firebase-config.js`
- **Project:** `safe-a67e3`

### A. Google Cloud — API key referrers (fixes login)

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials?project=safe-a67e3) → project **safe-a67e3**
2. Open the **Browser key** `AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE`
3. **Application restrictions** → **HTTP referrers (web sites)**
4. Add **exactly** (for default local server on port 8080):

   ```
   http://localhost:8080/*
   http://127.0.0.1:8080/*
   ```

   If you use another port, add `http://localhost:YOUR_PORT/*` (must match the URL in the browser).

5. **Save** and wait **2–5 minutes**, then hard-refresh (`Cmd+Shift+R`).

**Automated (if you have gcloud CLI):**

```bash
chmod +x scripts/allow-localhost-firebase.sh
./scripts/allow-localhost-firebase.sh
```

**API restrictions** on that key should include at least **Identity Toolkit API** (Firebase Auth). “Don’t restrict key” also works for local dev only (not recommended for production).

### B. Firebase — authorized domains

1. [Firebase Console](https://console.firebase.google.com/) → **safe-a67e3**
2. **Authentication** → **Settings** → **Authorized domains**
3. Ensure **`localhost`** is listed (add it if missing)

## 5. Deploy to Firebase Hosting (optional)

`firebase init` is already done in this repo (`firebase.json`, `.firebaserc` → project **safe-a67e3**).

```bash
npm install
npm run firebase:login    # opens browser — sign in with Google account that owns safe-a67e3
npm run firebase:deploy   # publishes static admin panel to Hosting
```

Or globally: `npm install -g firebase-tools`, then `firebase login` and `firebase deploy --only hosting`.

After deploy, add your Hosting URL (e.g. `https://safe-a67e3.web.app/*`) as an **HTTP referrer** on API key `AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE`, and add the domain under **Authentication → Authorized domains**.

## 6. Run admin locally

```bash
python3 -m http.server 8080
# or: npm start
```

Open http://localhost:8080/index.html and sign in with `admin@safeme.app` / `SafeMe123`.

## 7. Optional: separate police account

You can add another Firebase user (e.g. `police@safeme.app`) with its own password. Remove the default email placeholder in `index.html` if you prefer not to pre-fill `admin@safeme.app`.

## 8. Google Maps (complaint / SafeMe detail pages)

Admin maps use `assets/js/google-maps-config.js` (default key matches the mobile Android app).

1. [Google Cloud Console](https://console.cloud.google.com/) → same project as your Maps key
2. Enable **Maps JavaScript API**
3. Under **Credentials**, allow HTTP referrers: `http://localhost:*`, `http://127.0.0.1:*`, and your production domain
4. Replace `SAFEME_GOOGLE_MAPS_API_KEY` if you use a dedicated browser key

`ExpiredKeyMapError` means the old admin key expired — update `google-maps-config.js`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `auth/api-key-expired.-please-renew-the-api-key.` | Regenerate or create a new Browser API key in [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials?project=safe-a67e3) or copy `apiKey` from Firebase → **safe-a67e3** → Project settings → Your apps (web). Update `firebase-JS/firebase-config.js` (or `firebase-config.local.js`), re-add localhost referrers + Identity Toolkit API, wait 2–5 min, hard-refresh |
| `auth/requests-from-referer-…-are-blocked` | Add your dev URL as HTTP referrer on Firebase browser API key — **§4** above |
| Empty dashboard | Wrong project — confirm `firebase-JS/firebase.js` has `projectId: "safe-a67e3"` |
| `auth/user-not-found` | Create `admin@safeme.app` in Authentication |
| Permission denied on RTDB | Sign in first; check Database rules require `auth != null` |
| Images broken | Storage URLs in DB must use bucket `safe-a67e3.appspot.com` |

Mobile setup details: `SafeMe/FIREBASE_AUTH_SETUP.md`

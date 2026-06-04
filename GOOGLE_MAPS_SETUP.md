# Google Maps setup (SafeMe Admin)

The admin panel shows complaint/SafeMe locations on **safeMeFullDetails.html** and **editAndViewComplaints.html**.

## Fix `ApiNotActivatedMapError` (required)

Until this is fixed, the map tile area stays blank and the console shows `Uncaught Error` from `marker.js` / `map.js` — that is a follow-on failure, not a separate app bug.

This error means the **Maps JavaScript API** is not enabled for the Google Cloud project that owns your API key.

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Select the project linked to your Maps key (same project as the mobile app Maps key if you share it).
3. Go to **APIs & Services** → **Library**.
4. Search for **Maps JavaScript API** → click **Enable**.
5. Also enable **Maps JavaScript API** (not only “Maps SDK for Android/iOS” — those are separate and used by Flutter).

### Billing

Maps requires a billing account on the project (Google gives monthly free credit). Without billing, the map may fail even after enabling the API.

### API key restrictions

In **APIs & Services** → **Credentials** → your browser key:

- **Application restrictions**: HTTP referrers, for example:
  - `http://localhost/*`
  - `http://127.0.0.1/*`
  - Your production admin URL, e.g. `https://your-domain.com/*`
- **API restrictions**: restrict to **Maps JavaScript API** (and optionally Geocoding if you add it later).

Admin config file: `assets/js/google-maps-config.js`  
Uses the **safe-a67e3 browser key** (same as Firebase web: `AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE`).

Do **not** use the old **Android-only** Maps key in the admin panel — browsers show `gm_authFailure` / “Google Maps auth failed”.

On that browser key in [Credentials (safe-a67e3)](https://console.cloud.google.com/apis/credentials?project=safe-a67e3):

- **HTTP referrers** (one per **+ Add** row, no commas): `http://localhost/*`, `http://127.0.0.1/*`, plus your Hosting URL e.g. `https://safe-a67e3.web.app/*`
- **API restrictions:** click **Restrict key** → **Select APIs** → add at least:
  - **Maps JavaScript API** ← required or you get `gm_authFailure`
  - **Identity Toolkit API** (Firebase login on the same key)

If the key is restricted to Firebase APIs only, Maps will always fail auth even with referrers correct.

**Billing:** [Billing](https://console.cloud.google.com/billing?project=safe-a67e3) must be linked to the project.

### Admin fallback (no API)

If Cloud setup is not finished, map pages still show an **embedded Google Maps preview** (iframe) so location is visible. Fix Cloud to get the full interactive map + marker.

## Marker deprecation warning

The old **gmaps** plugin used `google.maps.Marker`. The admin app now uses **`AdvancedMarkerElement`** via `assets/js/safeme-map.js`, which removes that console warning.

## Map ID (optional for production)

Advanced markers use a **Map ID**:

- Dev: `DEMO_MAP_ID` in `google-maps-config.js` (default).
- Production: [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) → **Map Management** → **Create map ID** → set `SAFEME_GOOGLE_MAPS_MAP_ID` in `assets/js/google-maps-config.js`.

## Verify

1. Run the admin over HTTP: `python3 -m http.server 8080`
2. Open a record with latitude/longitude → detail page with the map.
3. Console should not show `ApiNotActivatedMapError` or `Marker is deprecated`.

## References

- [ApiNotActivatedMapError](https://developers.google.com/maps/documentation/javascript/error-messages#api-not-activated-map-error)
- [Advanced markers migration](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration)
- [Maps deprecations](https://developers.google.com/maps/deprecations)

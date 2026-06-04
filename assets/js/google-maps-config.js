/**
 * Google Maps JavaScript API — use the safe-a67e3 *browser* key (same project as Firebase web).
 * Do not use the old Android-only key here; browsers trigger gm_authFailure.
 *
 * Google Cloud (project safe-a67e3) → Credentials → this key:
 *   - HTTP referrers (one per row): http://localhost/* , http://127.0.0.1/*
 *   - API restrictions: Maps JavaScript API (+ Identity Toolkit if shared with Firebase)
 *
 * APIs & Services → Library → enable "Maps JavaScript API" + billing on the project.
 * See GOOGLE_MAPS_SETUP.md
 */
window.SAFEME_GOOGLE_MAPS_API_KEY = "AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE";

/** DEMO_MAP_ID works for local dev; create a Map ID in Cloud Console for production. */
window.SAFEME_GOOGLE_MAPS_MAP_ID = "DEMO_MAP_ID";

if (window.SAFEME_GOOGLE_MAPS_CONFIG_OVERRIDE) {
    Object.assign(window, window.SAFEME_GOOGLE_MAPS_CONFIG_OVERRIDE);
}

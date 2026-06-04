var SAFEME_EXPIRED_API_KEY_PREFIX = "AIzaSyD8TcLRnV2ehh";

(function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.location.replace("dashboard.html");
        }
    });
})();

/** Cached old firebase-config.js still triggers expired-key errors — warn before login. */
(function safemeCheckLoadedFirebaseConfig() {
    var cfg = window.SAFEME_FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey) {
        return;
    }
    if (cfg.apiKey.indexOf(SAFEME_EXPIRED_API_KEY_PREFIX) === 0) {
        console.warn("SafeMe: loaded expired API key — hard-refresh (Cmd+Shift+R) or use Incognito.");
        safemeShowApiKeyExpiredError(true);
    }
})();

/** Same Firebase Auth account as the mobile app service user (RTDB rules require auth). */
var ADMIN_EMAIL = "admin@safeme.app";
var ADMIN_PASSWORD = "SafeMe123";

var SAFEME_AUTH_PROXY = "http://127.0.0.1:8787";

function safemeIsLocalDev() {
    var h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1";
}

function safemeReferrerForAuth() {
    return window.location.origin + "/*";
}

function safemeIsReferrerBlocked(error) {
    return (
        (error && error.code && error.code.indexOf("referer") !== -1) ||
        (error && error.message && error.message.indexOf("referer") !== -1)
    );
}

function safemeIsApiKeyExpired(error) {
    return (
        (error && error.code === "auth/api-key-expired.-please-renew-the-api-key.") ||
        (error && error.message && error.message.indexOf("api-key-expired") !== -1)
    );
}

function safemeShowApiKeyExpiredError(fromCacheCheck) {
    var cacheNote = fromCacheCheck
        ? "<p class='text-start small mb-2'><strong>Browser cache:</strong> Your browser may still be using the <em>old</em> config file. Press <kbd>Cmd+Shift+R</kbd> (Mac) or <kbd>Ctrl+Shift+R</kbd> (Windows), or open this page in a <strong>Private/Incognito</strong> window.</p>"
        : "";
    Swal.fire({
        icon: "error",
        title: "Firebase API key expired",
        html:
            cacheNote +
            "<p class='text-start small mb-2'>The API key loaded in the browser is no longer valid. This project already has a new key in <code>firebase-JS/firebase-config.js</code> — you usually only need a hard-refresh.</p>" +
            "<ol class='text-start small mb-0'>" +
            "<li>Open <a href='https://console.firebase.google.com/project/safe-a67e3/settings/general' target='_blank' rel='noopener'>Firebase → Project settings</a> (project <strong>safe-a67e3</strong>)</li>" +
            "<li>Under <strong>Your apps</strong>, select the web app (or add one) and copy the new <code>apiKey</code></li>" +
            "<li>Or <a href='https://console.cloud.google.com/apis/credentials?project=safe-a67e3' target='_blank' rel='noopener'>Google Cloud → Credentials</a> → create/regenerate a <strong>Browser</strong> API key</li>" +
            "<li>Paste into <code>firebase-config.js</code> or <code>firebase-config.local.js</code> (see <code>firebase-config.local.example.js</code>)</li>" +
            "<li>Add HTTP referrers: <code>http://localhost:8080/*</code>, <code>http://127.0.0.1:8080/*</code></li>" +
            "<li>Enable API restrictions: <strong>Identity Toolkit API</strong> (Firebase Auth)</li>" +
            "</ol>",
        confirmButtonText: "Open Firebase settings",
        showCancelButton: true,
        cancelButtonText: "Close",
        width: 560,
    }).then(function (result) {
        if (result.isConfirmed) {
            window.open(
                "https://console.firebase.google.com/project/safe-a67e3/settings/general",
                "_blank",
                "noopener"
            );
        }
    });
}

function safemeShowReferrerBlockedError() {
    Swal.fire({
        icon: "error",
        title: "Login blocked for localhost",
        html:
            "<p class='text-start mb-2'><strong>Option A — Google Cloud</strong> (one-time)</p>" +
            "<ol class='text-start small'>" +
            "<li>Open <a href='https://console.cloud.google.com/apis/credentials?project=safe-a67e3' target='_blank' rel='noopener'>Credentials</a></li>" +
            "<li>Key <code>AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE</code> → HTTP referrers</li>" +
            "<li>Add <code>" +
            safemeReferrerForAuth() +
            "</code> and <code>http://127.0.0.1:" +
            (window.location.port || "8080") +
            "/*</code></li>" +
            "<li>Save, wait 2 min, hard-refresh</li>" +
            "</ol>" +
            "<p class='text-start mb-0'><strong>Option B — Dev proxy</strong> (no Cloud change)</p>" +
            "<ol class='text-start small mb-0'>" +
            "<li>Download <code>firebase-service-account.json</code> (Firebase → Project settings → Service accounts)</li>" +
            "<li>Terminal: <code>npm install</code> then <code>npm run auth-proxy</code></li>" +
            "<li>Keep proxy running; log in again on this page</li>" +
            "</ol>",
        confirmButtonText: "Open Credentials",
        showCancelButton: true,
        cancelButtonText: "Close",
        width: 560,
    }).then(function (result) {
        if (result.isConfirmed) {
            window.open(
                "https://console.cloud.google.com/apis/credentials?project=safe-a67e3",
                "_blank",
                "noopener"
            );
        }
    });
}

function safemeProxyLogin(email, password) {
    return fetch(SAFEME_AUTH_PROXY + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
    }).then(function (response) {
        return response.json().then(function (data) {
            if (!response.ok) {
                var err = new Error(data.error || "Proxy login failed");
                err.proxy = true;
                throw err;
            }
            return firebase.auth().signInWithCustomToken(data.customToken);
        });
    });
}

function safemeDirectLogin(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

function safemeAfterLogin() {
    window.location.replace("dashboard.html");
}

function safemeHandleLoginError(error, email, password) {
    console.log(error.code, error.message);

    if (safemeIsApiKeyExpired(error)) {
        safemeShowApiKeyExpiredError();
        return;
    }

    if (safemeIsReferrerBlocked(error) && safemeIsLocalDev()) {
        return safemeProxyLogin(email, password)
            .then(safemeAfterLogin)
            .catch(function (proxyErr) {
                console.warn("Proxy login failed:", proxyErr);
                safemeShowReferrerBlockedError();
            });
    }

    var message = error.message || "Login failed.";
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message =
            "Invalid email or password. Use admin@safeme.app / SafeMe123 " +
            "(create in Firebase Console → safe-a67e3 → Authentication).";
    } else if (error.code === "auth/invalid-email") {
        message = "Enter a valid email address.";
    } else if (error.proxy) {
        message = error.message;
    }

    Swal.fire({ icon: "error", text: message });
}

function signIn() {
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    var loginPromise = safemeDirectLogin(email, password);

    loginPromise
        .then(safemeAfterLogin)
        .catch(function (error) {
            safemeHandleLoginError(error, email, password);
        });
}

function signOut() {
    firebase.auth().signOut().catch(function (error) {
        console.log(error);
    });
}

function validate() {
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    if (email === "" || password === "") {
        Swal.fire({
            icon: "error",
            text: "Fill out both fields.",
        });
        return;
    }

    signIn();
}

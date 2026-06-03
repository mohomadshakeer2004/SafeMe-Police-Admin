(function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.location.replace("dashboard.html");
        }
    });
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

function safemeShowReferrerBlockedError() {
    Swal.fire({
        icon: "error",
        title: "Login blocked for localhost",
        html:
            "<p class='text-start mb-2'><strong>Option A — Google Cloud</strong> (one-time)</p>" +
            "<ol class='text-start small'>" +
            "<li>Open <a href='https://console.cloud.google.com/apis/credentials?project=safe-a67e3' target='_blank' rel='noopener'>Credentials</a></li>" +
            "<li>Key <code>AIzaSyD8TcLRnV2ehh_ThVlc88crscgc9_9HfKs</code> → HTTP referrers</li>" +
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

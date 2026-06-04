/**
 * Firebase web app config — project safe-a67e3 (Firebase Console → Your apps → Web).
 * RTDB URL matches the mobile app. Local override: firebase-config.local.js
 */
(function (w) {
    var base = {
        apiKey: "AIzaSyCWbI7XXxoW5QYB_MD_YFXtnQOi7yhA-HE",
        authDomain: "safe-a67e3.firebaseapp.com",
        databaseURL: "https://safe-a67e3-default-rtdb.firebaseio.com",
        projectId: "safe-a67e3",
        storageBucket: "safe-a67e3.appspot.com",
        messagingSenderId: "402309077340",
        appId: "1:402309077340:web:f947079b08f06b2636c999",
        measurementId: "G-D62E9PBVLH",
    };

    if (w.SAFEME_FIREBASE_CONFIG_OVERRIDE) {
        for (var key in w.SAFEME_FIREBASE_CONFIG_OVERRIDE) {
            if (Object.prototype.hasOwnProperty.call(w.SAFEME_FIREBASE_CONFIG_OVERRIDE, key)) {
                base[key] = w.SAFEME_FIREBASE_CONFIG_OVERRIDE[key];
            }
        }
    }

    w.SAFEME_FIREBASE_CONFIG = base;
})(window);

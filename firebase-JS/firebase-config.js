/**
 * Firebase config — must match mobile app (SafeMe/lib/firebase_options.dart).
 * Project: safe-a67e3
 *
 * Local override: copy firebase-config.local.example.js → firebase-config.local.js
 */
(function (w) {
    var base = {
        apiKey: "AIzaSyD8TcLRnV2ehh_ThVlc88crscgc9_9HfKs",
        authDomain: "safe-a67e3.firebaseapp.com",
        databaseURL: "https://safe-a67e3-default-rtdb.firebaseio.com",
        projectId: "safe-a67e3",
        storageBucket: "safe-a67e3.appspot.com",
        messagingSenderId: "402309077340",
        appId: "1:402309077340:android:7f68eb69516366a436c999",
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

/**
 * Loads Maps JS API once (async), then runs queued initializers.
 */
(function () {
    window.SAFEME_MAP_INIT_QUEUE = window.SAFEME_MAP_INIT_QUEUE || [];

    window.safemeQueueMapInit = function (fn) {
        if (window.SAFEME_MAPS_AUTH_FAILED) {
            fn();
            return;
        }
        if (
            typeof window.google !== "undefined" &&
            window.google.maps &&
            window.google.maps.importLibrary
        ) {
            fn();
        } else {
            window.SAFEME_MAP_INIT_QUEUE.push(fn);
        }
    };

    window.safemeOnGoogleMapsReady = function () {
        (window.SAFEME_MAP_INIT_QUEUE || []).forEach(function (fn) {
            try {
                fn();
            } catch (err) {
                console.warn("SafeMe map init failed:", err);
            }
        });
        window.SAFEME_MAP_INIT_QUEUE = [];
    };

    window.gm_authFailure = function () {
        window.SAFEME_MAPS_AUTH_FAILED = true;
        console.warn(
            "[SafeMe Maps] gm_authFailure — origin:",
            window.location.origin,
            "— using embed fallback. Enable Maps JavaScript API on your browser key in safe-a67e3."
        );
        window.safemeOnGoogleMapsReady();
    };

    var key = window.SAFEME_GOOGLE_MAPS_API_KEY;
    if (!key) {
        document.querySelectorAll(".gmaps").forEach(function (el) {
            el.innerHTML =
                '<p class="text-muted p-3 mb-0">Set <code>SAFEME_GOOGLE_MAPS_API_KEY</code> in <code>assets/js/google-maps-config.js</code></p>';
        });
        return;
    }

    console.info(
        "[SafeMe Maps] Loading API. Page origin:",
        window.location.origin,
        "| Key:",
        String(key).slice(0, 10) + "…"
    );

    if (document.querySelector('script[data-safeme-maps="1"]')) {
        return;
    }

    var script = document.createElement("script");
    script.setAttribute("data-safeme-maps", "1");
    script.async = true;
    script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        encodeURIComponent(key) +
        "&loading=async&callback=safemeOnGoogleMapsReady";
    script.onerror = function () {
        window.SAFEME_MAPS_AUTH_FAILED = true;
        console.error("[SafeMe Maps] Script failed to load.");
        window.safemeOnGoogleMapsReady();
    };
    document.head.appendChild(script);
})();

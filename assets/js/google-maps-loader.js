/**
 * Loads Maps JS API once (async), then runs queued initializers.
 */
(function () {
    window.SAFEME_MAP_INIT_QUEUE = window.SAFEME_MAP_INIT_QUEUE || [];

    window.safemeQueueMapInit = function (fn) {
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
        document.querySelectorAll(".gmaps").forEach(function (el) {
            el.innerHTML =
                '<p class="text-danger p-3 mb-0"><strong>Google Maps auth failed.</strong> ' +
                "Check API key restrictions and that <strong>Maps JavaScript API</strong> is enabled. " +
                'See <a href="GOOGLE_MAPS_SETUP.md" target="_blank" rel="noopener">GOOGLE_MAPS_SETUP.md</a>.</p>';
        });
    };

    var key = window.SAFEME_GOOGLE_MAPS_API_KEY;
    if (!key) {
        document.querySelectorAll(".gmaps").forEach(function (el) {
            el.innerHTML =
                '<p class="text-muted p-3 mb-0">Set <code>SAFEME_GOOGLE_MAPS_API_KEY</code> in <code>assets/js/google-maps-config.js</code></p>';
        });
        return;
    }

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
        document.querySelectorAll(".gmaps").forEach(function (el) {
            el.innerHTML =
                '<p class="text-danger p-3 mb-0">Google Maps script failed to load. Check network, API key, and billing.</p>';
        });
    };
    document.head.appendChild(script);
})();

// SafeMe detail map — live GPS from Firebase (shake emergency updates coords in realtime)
(function ($) {
    "use strict";

    function parseCoord(value) {
        var n = parseFloat(value);
        return isNaN(n) ? null : n;
    }

    var mapApi = null;
    var markerApi = null;
    var liveUnsub = null;
    var authUnsub = null;

    function escapeHtml(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function renderAt(lat, lng, meta) {
        var $container = $("#gmaps-markers");
        if (!$container.length) {
            return;
        }

        if (lat === null || lng === null || (lat === 0 && lng === 0)) {
            $container.html('<p class="text-muted p-3 mb-0">Location not available.</p>');
            return;
        }

        localStorage.setItem("SafeMeLat", String(lat));
        localStorage.setItem("SafeMeLong", String(lng));

        var reportedDate = (meta && meta.Date) || localStorage.getItem("SafeMeDate") || "—";
        var severity = (meta && meta.Severity) || localStorage.getItem("SafeMeSeverity") || "—";
        var personName = escapeHtml(
            (meta && meta.Name) || localStorage.getItem("SafeMeName") || "Citizen"
        );
        if (meta && meta.Name) {
            localStorage.setItem("SafeMeName", meta.Name);
            var locNameEl = document.getElementById("safeme-loc-user-name");
            if (locNameEl) {
                locNameEl.textContent = meta.Name;
            }
        }
        var live = meta && (meta.LiveLocation === true || meta.LiveLocation === "true");
        var updatedAt = (meta && meta.LocationUpdatedAt) || "";
        var liveLine = live
            ? "<br><strong style='color:#b71c1c'>LIVE GPS (phone shake)</strong>" +
              "<br><span style='font-size:12px'><strong>" +
              personName +
              "</strong> — current &amp; live location from citizen app</span>" +
              (updatedAt ? "<br><span style='font-size:12px'>Updated " + updatedAt + "</span>" : "")
            : "<br><span style='font-size:12px'><strong>" +
              personName +
              "</strong> — reported location</span>";

        var infoHtml =
            "<p><strong>" +
            personName +
            "</strong><br>Latitude: " +
            lat +
            "<br>Longitude: " +
            lng +
            "<br>Date: " +
            reportedDate +
            "<br>Severity: " +
            severity +
            liveLine +
            "</p>";

        if (typeof window.safemeRenderDetailMap !== "function") {
            $container.html('<p class="text-muted p-3 mb-0">Map library not loaded.</p>');
            return;
        }

        // Prefer moving an existing marker if available; otherwise re-render.
        if (mapApi && markerApi) {
            try {
                if (typeof markerApi.setPosition === "function") {
                    markerApi.setPosition({ lat: lat, lng: lng });
                } else if ("position" in markerApi) {
                    markerApi.position = { lat: lat, lng: lng };
                }
                if (typeof mapApi.panTo === "function") {
                    mapApi.panTo({ lat: lat, lng: lng });
                } else if (typeof mapApi.setCenter === "function") {
                    mapApi.setCenter({ lat: lat, lng: lng });
                }
            } catch (e) {
                console.warn("Live marker move failed, re-rendering", e);
                mapApi = null;
                markerApi = null;
            }
            if (mapApi) {
                var panel = document.querySelector(".safeme-map-details");
                if (panel) {
                    panel.innerHTML = infoHtml;
                }
                return;
            }
        }

        var result = window.safemeRenderDetailMap({
            container: "#gmaps-markers",
            lat: lat,
            lng: lng,
            title: live
                ? personName + " — live location"
                : personName + " — location",
            infoContent: infoHtml,
        });

        if (result && typeof result.then === "function") {
            result
                .then(function (api) {
                    if (api && api.map) {
                        mapApi = api.map;
                        markerApi = api.marker || null;
                    }
                })
                .catch(function () {});
        }
    }

    function stopLiveListener() {
        if (liveUnsub) {
            try {
                liveUnsub();
            } catch (e) {}
            liveUnsub = null;
        }
    }

    function startLiveListener() {
        stopLiveListener();

        var sid = localStorage.getItem("SafeMeID");
        if (!sid || typeof firebase === "undefined") {
            return;
        }

        var ref = firebase.database().ref("SafeMe/All/" + sid);
        var handler = function (snapshot) {
            var d = snapshot.val();
            if (!d) {
                return;
            }
            var la = parseCoord(d.Latitude);
            var lo = parseCoord(d.Longitude);
            renderAt(la, lo, d);
        };
        var errHandler = function (err) {
            console.error("SafeMe live map failed:", err);
        };
        ref.on("value", handler, errHandler);
        liveUnsub = function () {
            ref.off("value", handler);
        };
    }

    function initMap() {
        var lat = parseCoord(localStorage.getItem("SafeMeLat"));
        var lng = parseCoord(localStorage.getItem("SafeMeLong"));
        renderAt(lat, lng, null);

        if (typeof firebase === "undefined" || !firebase.auth) {
            startLiveListener();
            return;
        }

        if (authUnsub) {
            try {
                authUnsub();
            } catch (e) {}
        }
        authUnsub = firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                startLiveListener();
            } else {
                stopLiveListener();
            }
        });
    }

    $(function () {
        if (typeof window.safemeQueueMapInit === "function") {
            window.safemeQueueMapInit(initMap);
        } else {
            initMap();
        }
    });
})(window.jQuery);

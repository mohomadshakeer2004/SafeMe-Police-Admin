/**
 * SafeMe detail maps — embed fallback (no API), classic map, or AdvancedMarker.
 */
(function (w) {
    "use strict";

    function resolveContainer(container) {
        return typeof container === "string"
            ? document.querySelector(container)
            : container;
    }

    function showMapMessage(el, html) {
        if (!el) {
            return;
        }
        el.innerHTML = html;
        el.classList.add("safeme-map-wrap");
    }

    function mapsSetupHelp() {
        return (
            'Enable <strong>Maps JavaScript API</strong> on API key ' +
            '<code>AIzaSyCWbI7…</code> in project <strong>safe-a67e3</strong> ' +
            '(<a href="GOOGLE_MAPS_SETUP.md" target="_blank" rel="noopener">GOOGLE_MAPS_SETUP.md</a>).'
        );
    }

    function authNoticeHtml() {
        if (!w.SAFEME_MAPS_AUTH_FAILED) {
            return "";
        }
        return (
            '<p class="text-warning small mb-2 safeme-map-auth-notice">' +
            "<strong>Interactive map blocked</strong> (API key / Cloud setup). " +
            "Showing embedded preview. " +
            mapsSetupHelp() +
            "</p>"
        );
    }

    function showLocationFallback(el, options) {
        var lat = options.lat;
        var lng = options.lng;
        var mapsUrl =
            "https://www.google.com/maps?q=" + encodeURIComponent(lat + "," + lng);
        var html =
            authNoticeHtml() +
            (options.infoContent || "") +
            '<p class="mb-0 mt-2"><a href="' +
            mapsUrl +
            '" target="_blank" rel="noopener">Open in Google Maps</a></p>' +
            '<p class="text-danger small mb-0 mt-2">' +
            mapsSetupHelp() +
            "</p>";
        showMapMessage(el, html);
    }

    function whenMapReady(map, timeoutMs) {
        return new Promise(function (resolve, reject) {
            var done = false;
            var timer = setTimeout(function () {
                if (!done) {
                    done = true;
                    reject(new Error("Map did not finish loading"));
                }
            }, timeoutMs || 8000);

            var finish = function () {
                if (done) {
                    return;
                }
                done = true;
                clearTimeout(timer);
                resolve(map);
            };

            if (w.google && w.google.maps && w.google.maps.event) {
                w.google.maps.event.addListenerOnce(map, "idle", finish);
                w.google.maps.event.addListenerOnce(map, "tilesloaded", finish);
            } else {
                setTimeout(finish, 500);
            }
        });
    }

    /** Works without Maps JavaScript API key (gm_authFailure fallback). */
    w.safemeRenderEmbedMap = function (options) {
        var el = resolveContainer(options.container);
        if (!el) {
            return Promise.resolve();
        }

        var lat = options.lat;
        var lng = options.lng;
        var embedSrc =
            "https://www.google.com/maps?q=" +
            encodeURIComponent(lat + "," + lng) +
            "&z=" +
            (options.zoom || 15) +
            "&output=embed";

        el.innerHTML = "";
        el.classList.add("safeme-map-wrap");
        el.dataset.safemeMapRendered = "embed";

        if (options.infoContent) {
            var panel = document.createElement("div");
            panel.className = "safeme-map-details";
            panel.innerHTML = authNoticeHtml() + options.infoContent;
            el.appendChild(panel);
        } else if (w.SAFEME_MAPS_AUTH_FAILED) {
            var notice = document.createElement("div");
            notice.className = "safeme-map-details";
            notice.innerHTML = authNoticeHtml();
            el.appendChild(notice);
        }

        var iframe = document.createElement("iframe");
        iframe.className = "safeme-map-embed";
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
        iframe.setAttribute(
            "allowfullscreen",
            ""
        );
        iframe.src = embedSrc;
        iframe.title = options.title || "Location map";
        el.appendChild(iframe);

        return Promise.resolve();
    };

    function renderClassicMap(el, options) {
        var position = { lat: options.lat, lng: options.lng };

        el.innerHTML = "";
        el.classList.add("safeme-map-wrap");
        el.dataset.safemeMapRendered = "classic";

        var canvas = document.createElement("div");
        canvas.className = "safeme-map-canvas";
        el.appendChild(canvas);

        if (options.infoContent) {
            var panel = document.createElement("div");
            panel.className = "safeme-map-details";
            panel.innerHTML = options.infoContent;
            el.appendChild(panel);
        }

        var map = new w.google.maps.Map(canvas, {
            center: position,
            zoom: options.zoom || 15,
            mapTypeControl: true,
            fullscreenControl: true,
        });

        return whenMapReady(map).then(function (readyMap) {
            new w.google.maps.Marker({
                map: readyMap,
                position: position,
                title: options.title || "Location",
            });
            return readyMap;
        });
    }

    w.safemeRenderDetailMap = function (options) {
        var el = resolveContainer(options.container);

        if (!el) {
            return Promise.resolve();
        }

        if (w.SAFEME_MAPS_AUTH_FAILED) {
            return w.safemeRenderEmbedMap(options);
        }

        if (!w.google || !w.google.maps) {
            showMapMessage(
                el,
                '<p class="text-muted p-3 mb-0">Google Maps is still loading…</p>'
            );
            return Promise.resolve();
        }

        if (!w.google.maps.importLibrary) {
            return renderClassicMap(el, options).catch(function (err) {
                console.warn("SafeMe classic map failed:", err);
                return w.safemeRenderEmbedMap(options);
            });
        }

        return w.google.maps
            .importLibrary("maps")
            .then(function (mapsLib) {
                return w.google.maps.importLibrary("marker").then(function (markerLib) {
                    return { mapsLib: mapsLib, markerLib: markerLib };
                });
            })
            .then(function (libs) {
                var Map = libs.mapsLib.Map;
                var AdvancedMarkerElement = libs.markerLib.AdvancedMarkerElement;
                var mapId = w.SAFEME_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
                var position = { lat: options.lat, lng: options.lng };

                el.innerHTML = "";
                el.classList.add("safeme-map-wrap");
                el.dataset.safemeMapRendered = "advanced";

                var canvas = document.createElement("div");
                canvas.className = "safeme-map-canvas";
                el.appendChild(canvas);

                if (options.infoContent) {
                    var panel = document.createElement("div");
                    panel.className = "safeme-map-details";
                    panel.innerHTML = options.infoContent;
                    el.appendChild(panel);
                }

                var map = new Map(canvas, {
                    center: position,
                    zoom: options.zoom || 15,
                    mapId: mapId,
                    mapTypeControl: true,
                    fullscreenControl: true,
                });

                return whenMapReady(map).then(function (readyMap) {
                    try {
                        new AdvancedMarkerElement({
                            map: readyMap,
                            position: position,
                            title: options.title || "Location",
                        });
                    } catch (markerErr) {
                        console.warn("SafeMe advanced marker failed:", markerErr);
                        new w.google.maps.Marker({
                            map: readyMap,
                            position: position,
                            title: options.title || "Location",
                        });
                    }
                    return readyMap;
                });
            })
            .catch(function (err) {
                console.warn("SafeMe advanced map failed, trying classic:", err);
                return renderClassicMap(el, options);
            })
            .catch(function (err) {
                console.warn("SafeMe classic map failed, using embed:", err);
                return w.safemeRenderEmbedMap(options);
            });
    };
})(window);

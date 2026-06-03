/**
 * SafeMe detail maps — AdvancedMarkerElement + static info panel (no InfoWindow).
 */
(function (w) {
    "use strict";

    function showMapMessage(el, html) {
        if (!el) {
            return;
        }
        el.innerHTML = html;
        el.classList.add("safeme-map-wrap");
    }

    function mapsSetupHelp() {
        return (
            "Enable <strong>Maps JavaScript API</strong> for your API key in Google Cloud Console " +
            '(see <a href="GOOGLE_MAPS_SETUP.md" target="_blank" rel="noopener">GOOGLE_MAPS_SETUP.md</a>).'
        );
    }

    function showLocationFallback(el, options) {
        var lat = options.lat;
        var lng = options.lng;
        var mapsUrl =
            "https://www.google.com/maps?q=" + encodeURIComponent(lat + "," + lng);
        var html =
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

    w.safemeRenderDetailMap = function (options) {
        var el =
            typeof options.container === "string"
                ? document.querySelector(options.container)
                : options.container;

        if (!el) {
            return Promise.resolve();
        }

        if (!w.google || !w.google.maps || !w.google.maps.importLibrary) {
            showMapMessage(
                el,
                '<p class="text-muted p-3 mb-0">Google Maps is still loading…</p>'
            );
            return Promise.resolve();
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
                    }
                    return readyMap;
                });
            })
            .catch(function (err) {
                console.error("SafeMe map render failed:", err);
                showLocationFallback(el, options);
            });
    };
})(window);

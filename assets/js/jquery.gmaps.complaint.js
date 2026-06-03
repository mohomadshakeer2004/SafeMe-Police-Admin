// Complaint detail map — coordinates from localStorage (editAndViewComplaints.html)
(function ($) {
    "use strict";

    function parseCoord(value) {
        var n = parseFloat(value);
        return isNaN(n) ? null : n;
    }

    function initMap() {
        var $container = $("#gmaps-markers");
        if (!$container.length) {
            return;
        }

        var lat = parseCoord(localStorage.getItem("ComplaintLatitude"));
        var lng = parseCoord(localStorage.getItem("ComplaintLongitude"));
        var type = localStorage.getItem("ComplaintType") || "—";
        var complaintDate = localStorage.getItem("ComplaintDate") || "—";

        if (lat === null || lng === null) {
            $container.html('<p class="text-muted p-3 mb-0">Location not available.</p>');
            return;
        }

        if (typeof window.safemeRenderDetailMap !== "function") {
            $container.html('<p class="text-muted p-3 mb-0">Map library not loaded.</p>');
            return;
        }

        window.safemeRenderDetailMap({
            container: "#gmaps-markers",
            lat: lat,
            lng: lng,
            title: "Complaint location",
            infoContent:
                "<p>Latitude: " +
                lat +
                "<br>Longitude: " +
                lng +
                "<br>Type: " +
                type +
                "<br>Date: " +
                complaintDate +
                "</p>",
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

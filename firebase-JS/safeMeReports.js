/**Check the user in logged in or not */
(function(){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // ...
        } else {
            // User is signed out
            window.location.replace("index.html");
        }
    });
})();

/***************Getting the values from previous page******************/
var SIDFromPrevoiusPage;

SIDFromPrevoiusPage = localStorage.getItem("ReportSID");
safemeDom.setHtml('report-sid', SIDFromPrevoiusPage);

function setDetails() {
    if (!SIDFromPrevoiusPage) {
        return;
    }
    firebase.database().ref('SafeMe/All/' + SIDFromPrevoiusPage).on('value', function (snapshot) {
        var d = snapshot.val();
        if (!d) {
            return;
        }
        safemeDom.setText('report-name', d.Name);
        safemeDom.setText('report-mobile', d.Mobile);
        safemeDom.setText('report-address', d.Address);
        safemeDom.setText('report-district', d.District);
        safemeDom.setText('report-date', d.Date);
        safemeDom.setText('report-nic', d.NIC);
        safemeDom.setText('report-email', d.Email);
        safemeDom.setText('report-city', d.City);
        safemeDom.setText('report-longitude', d.Longitude);
        safemeDom.setText('report-latitude', d.Latitude);
        safemeDom.setText('report-status', d.Status);
        safemeDom.setText('report-severity', d.Severity);
    });
}

setDetails();
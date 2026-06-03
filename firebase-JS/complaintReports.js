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
var CIDFromPrevoiusPage;

CIDFromPrevoiusPage = localStorage.getItem("ReportCID");
safemeDom.setHtml('report-cid', CIDFromPrevoiusPage);

function setDetails() {
    if (!CIDFromPrevoiusPage) {
        return;
    }
    firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).on('value', function (snapshot) {
        var d = snapshot.val();
        if (!d) {
            return;
        }
        safemeDom.setText('report-name', d.Name);
        safemeDom.setText('report-mobile', d.Mobile);
        safemeDom.setText('report-address', d.Address);
        safemeDom.setText('report-district', d.District);
        safemeDom.setText('report-type', d.Type);
        safemeDom.setText('report-date', d.Date);
        safemeDom.setText('report-nic', d.NIC);
        safemeDom.setText('report-email', d.Email);
        safemeDom.setText('report-city', d.City);
        safemeDom.setText('report-description', d.Description);
        safemeDom.setText('report-longitude', d.Longitude);
        safemeDom.setText('report-latitude', d.Latitude);
        safemeDom.setText('report-status', d.Status);
    });
}

setDetails();
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

function signOut(){
    firebase.auth().signOut().then(() => {
        console.log("Signed Out");
        window.location.replace("index.html");
    }).catch((error) => {
        // An error happened.
    });

}
function goToDashboard(){
    window.location.replace("dashboard.html");
}

function goToComplaints(){
    window.location.replace("complaints.html");
}

function goToPublicAppointments(){
    window.location.replace("publicAppointments.html");
}

function goToPoliceAppointments(){
    window.location.replace("policeAppointments.html");
}

function goToSafeMe(){
    window.location.replace("safeMe.html");
}

function goToPublicUsers(){
    window.location.replace("publicUsers.html");
}

function goToAddPoliceAppointments(){
    window.location.replace("addPoliceAppointments.html");
}

function goToReports(){
    window.location.replace("reports.html");
}

function goToSummaryReports(){
    window.location.replace("summaryReports.html");
}

(function () {
    var badge = document.getElementById('safe-me-notification');
    if (!badge) {
        return;
    }
    firebase.database().ref('SafeMe').on('value', function (snapshot) {
        var data = snapshot.val();
        if (data && data.PendingCount != null) {
            badge.textContent = data.PendingCount;
        }
    });
})();

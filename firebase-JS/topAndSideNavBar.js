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
    window.location.href = "dashboard.html";
}

function goToComplaints(){
    window.location.href = "complaints.html";
}

function goToPublicAppointments(){
    window.location.href = "publicAppointments.html";
}

function goToPoliceAppointments(){
    window.location.href = "policeAppointments.html";
}

function goToSafeMe(){
    window.location.href = "safeMe.html";
}

function goToPublicUsers(){
    window.location.href = "publicUsers.html";
}

function goToAddPoliceAppointments(){
    window.location.href = "addPoliceAppointments.html";
}

function goToLostAndFound(){
    window.location.href = "lostAndFound.html";
}

function goToReports(){
    window.location.href = "reports.html";
}

function goToSummaryReports(){
    window.location.href = "summaryReports.html";
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

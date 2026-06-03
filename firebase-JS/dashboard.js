/** Setting the upper cards values using database */
function bindCount(refPath, elementId, field) {
    firebase.database().ref(refPath).on('value', function (snapshot) {
        var data = snapshot.val();
        if (data && typeof safemeDom !== 'undefined') {
            safemeDom.setText(elementId, data[field]);
        }
    });
}

bindCount('Complaints', 'complaint-count', 'ComplaintCount');
bindCount('Appointments', 'public-appointments', 'PublicAppointmentCount');
bindCount('SafeMe', 'total-safeMe', 'TotalCount');
bindCount('SafeMe', 'pending-safeMe', 'PendingCount');
bindCount('PublicUsers', 'user-count', 'UserCount');
bindCount('Appointments', 'police-appointments', 'PoliceAppointmentCount');
bindCount('SafeMe', 'completed-safeMe', 'CompletedCount');
bindCount('Complaints', 'lost-and-found', 'LostAndFoundCount');

var cardClass = document.getElementById('complaints-pending');
var cardClass2 = document.getElementById('appointments-table-public');

function PendingComplaintFunction(CID, Name, NIC, Date, City, Status) {
    return `
      <tr>
             <td >${CID}</td>
             <td >${Name}</td>
             <td>${NIC}</td>
             <td>${Date}</td>
             <td> ${City}</td>
             <td><span class="badge badge-soft-primary">${Status}</span></td>
             </tr>
    `;
}

function PublicAppointmentFunction(AID, Name, NIC, Date, City, Status) {
    return `
      <tr>
             <td >${AID}</td>
             <td >${Name}</td>
             <td>${NIC}</td>
             <td>${Date}</td>
             <td> ${City}</td>
             <td><span class="badge badge-soft-primary">${Status}</span></td>
             </tr>
    `;
}

function showPendingComplaints(cards) {
    safemeDom.renderRows(cardClass, cards);
}

function showPendingPublicAppointments(cards) {
    safemeDom.renderRows(cardClass2, cards);
}

async function fetchAllPendingComplaintsAwait() {
    var cards = [];
    await firebase.database().ref('Complaints/All').once('value', function (snapshot) {
        snapshot.forEach(function (ChildSnapshot) {
            var row = ChildSnapshot.val();
            if (row && row.Status === 'Pending') {
                cards.push(PendingComplaintFunction(row.CID, row.Name, row.NIC, row.Date, row.City, row.Status));
            }
        });
    });
    return cards;
}

async function fetchAllPendingPublicAppointment() {
    var cards = [];
    await firebase.database().ref('Appointments/PublicAppointments').once('value', function (snapshot) {
        snapshot.forEach(function (ChildSnapshot) {
            var row = ChildSnapshot.val();
            if (row && row.ScheduledDate === 'Pending') {
                cards.push(PublicAppointmentFunction(row.AID, row.Name, row.NIC, row.RequestedDate, row.City, row.ScheduledDate));
            }
        });
    });
    return cards;
}

async function fetchPendingComplaints() {
    showPendingComplaints(await fetchAllPendingComplaintsAwait());
}

async function fetchPendingPublicAppointment() {
    showPendingPublicAppointments(await fetchAllPendingPublicAppointment());
}

(function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.replace('index.html');
        }
    });
})();

function signOut() {
    firebase.auth().signOut().then(() => {
        window.location.replace('index.html');
    }).catch((error) => {
        console.warn(error);
    });
}

if (cardClass) {
    fetchPendingComplaints();
}
if (cardClass2) {
    fetchPendingPublicAppointment();
}

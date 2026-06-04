/**Check the user in logged in or not */


(function () {
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

//variables
var cardClass3 = document.getElementById('complaintSummary_table');
var cardClass4 = document.getElementById('safeMeSummary_table');
var cardClass5 = document.getElementById('appointmentSummary_table');
var cardClass6 = document.getElementById('userSummary_table');

/**Generate Complaints function******************************************************************** */
function generateComplaintsSummary(ProfileImage, Name, NIC, ContactNo, CID, City, Status, Address, Date, Description, District, Email, Image1, Image2, Longitude, Latitude, Reason, Type) {
    var htmlCard = `
          <tr>
                <td>${CID}</td>
                <td>${District}</td>
                <td>${City}</td>
                <td>${NIC}</td>
                <td>${Type}</td>
                <td>${Date}</td>
                 <td>${Status}</td>
          </tr>
           `
    return htmlCard
}

function showComplaintsSummry(cards) {
    safemeDom.renderRows(cardClass3, cards);
}

async function fetchAllComplaintsSummryAwait() {
    var rows = await SafeMeComplaints.fetchAllComplaintsMerged();
    return rows.map(function (row) {
        return generateComplaintsSummary(
            row.ProfileImage, row.Name, row.NIC, row.Mobile, row.CID, row.City, row.Status,
            row.Address, row.Date, row.Description, row.District, row.Email, row.Image1, row.Image2,
            row.Longitude, row.Latitude, row.Reason, row.Type
        );
    });
}

async function fetchAllComplaintsSummry() {
    if (!cardClass3) {
        return;
    }
    showComplaintsSummry(await fetchAllComplaintsSummryAwait());
}


/** Generate SafeMe function ******************************************************************* */
function safeMeFunction(SID, Name, NIC, Contact, City, Severity, Status, ProfileImage, Audio, Image1, Image2, Image3, Image4, Image5, District, Lat, Long, Email, Address) {
    var htmlCard = `
<tr>
            
           <td>${SID}</td>
           <td>${District}</td>
           <td>${City}</td>
           <td>${NIC}</td>
           <td>${Contact}</td>
           <td>${Status}</td>
           </tr>
`
    return htmlCard
}

function showSafeMe(cards) {
    safemeDom.renderRows(cardClass4, cards);
}

async function fetchAllSafeMeAwait() {
    var cards = []
    var task = await firebase.database().ref('SafeMe/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let SID = ChildSnapshot.val().SID;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let Contact = ChildSnapshot.val().Mobile;
                let City = ChildSnapshot.val().City;
                let Date = ChildSnapshot.val().Date;
                let Severity = ChildSnapshot.val().Severity;
                let Status = ChildSnapshot.val().Status;
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Audio = ChildSnapshot.val().AudioMP3;
                let Image1 = ChildSnapshot.val().Image1;
                let Image2 = ChildSnapshot.val().Image2;
                let Image3 = ChildSnapshot.val().Image3;
                let Image4 = ChildSnapshot.val().Image4;
                let Image5 = ChildSnapshot.val().Image5;
                let District = ChildSnapshot.val().District;
                let Long = ChildSnapshot.val().Longitude;
                let Lat = ChildSnapshot.val().Latitude;
                let Email = ChildSnapshot.val().Email;
                let Address = ChildSnapshot.val().Address;

                cards.push(safeMeFunction(SID, Name, NIC, Contact, City, Severity, Status, ProfileImage, Audio, Image1, Image2, Image3, Image4, Image5, District, Lat, Long, Email, Address));
            }
        );
    });
    return cards
}

async function fetchAllSafeMe() {
    if (!cardClass4) {
        return;
    }
    showSafeMe(await fetchAllSafeMeAwait());
}


/**Generate appointment function******************************************************************** */

function generateAppointments(ProfileImage, Name, NIC, ContactNo, AID, City, RequestedDate, Status) {
    var htmlCard = `
          <tr>
              <td>${AID}</td>
              <td>${City}</td>
              <td>${NIC}</td>
              <td>${ContactNo}</td>
              <td>${RequestedDate}</td>
              <td>${Status}</td>
             
          </tr>
           `
    return htmlCard
}

function showAppointments(cards) {
    safemeDom.renderRows(cardClass5, cards);
}

async function fetchAllAppointmentsAwait() {
    var rows = await SafeMeAppointments.fetchAllPublicAppointmentsMerged();
    return rows.map(function (row) {
        return generateAppointments(
            row.ProfileImage,
            row.Name,
            row.NIC,
            row.Mobile,
            row.AID,
            row.City,
            row.RequestedDate,
            row.ScheduledDate
        );
    });
}

async function fetchAllAppointments() {
    if (!cardClass5) {
        return;
    }
    showAppointments(await fetchAllAppointmentsAwait());
}


/**Generate user function******************************************************************** */


function generateUsers(UserPic, Name, Email, NIC, Mobile, City, District, Address) {
    var htmlCard = `
          <tr>
              <td>${NIC}</td>
              <td>${District}</td>
              <td>${City}</td>
              <td>${Name}</td>
              <td>${Mobile}</td>
              <td>${Email}</td>
              <td>${Address}</td>
             
          </tr>
           `
    return htmlCard
}

function showUsers(cards) {
    safemeDom.renderRows(cardClass6, cards);
}

async function fetchAllUsersAwait() {
    var cards = []

    var task = await firebase.database().ref('PublicUsers/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let UserPic = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let Email = ChildSnapshot.val().Email;
                let NIC = ChildSnapshot.val().NIC;
                let Mobile = ChildSnapshot.val().Mobile;
                let City = ChildSnapshot.val().City;
                let District = ChildSnapshot.val().District;
                let Address = ChildSnapshot.val().Address;

                cards.push(generateUsers(UserPic, Name, Email, NIC, Mobile, City, District, Address));
            }
        );
    });
    return cards
}

async function fetchAllUsers() {
    if (!cardClass6) {
        return;
    }
    showUsers(await fetchAllUsersAwait());
}


if (cardClass6) {
    fetchAllUsers();
}
if (cardClass3) {
    fetchAllComplaintsSummry();
}
if (cardClass4) {
    fetchAllSafeMe();
}
if (cardClass5) {
    fetchAllAppointments();
}
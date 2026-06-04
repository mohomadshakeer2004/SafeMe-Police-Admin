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

//variables
var cardClass = document.getElementById('complaint_table');
var cardClass2 = document.getElementById('safeme_table');

/**Generate Complaints function******************************************************************** */
function generateComplaints(ProfileImage, Name, NIC, ContactNo, CID, City, Status, Address, Date, Description, District, Email, Image1, Image2, Longitude, Latitude, Reason, Type) {
    var htmlCard = `
          <tr>
                <td><img src=${ProfileImage} alt="" class="rounded-circle thumb-xs me-1">${Name}</td>
                <td>${NIC}</td>
                <td>${ContactNo}</td>
                <td>${CID}</td>
                <td>${City}</td>
                <td><span class="badge badge-soft-primary">${Status}</span></td>
                <td class="text-end">
                     <a href="complaintReports.html" onclick="generateComplaintReports('${CID}')" target="_blank" rel="noopener noreferrer"><i class="las dripicons-document text-secondary font-18"></i></a>
                </td>
          </tr>
           `
    return htmlCard
}

function showComplaints(cards) {
    safemeDom.renderRows(cardClass, cards);
}

async function fetchAllComplaintsAwait() {
    var rows = await SafeMeComplaints.fetchAllComplaintsMerged();
    return rows.map(function (row) {
        return generateComplaints(
            row.ProfileImage, row.Name, row.NIC, row.Mobile, row.CID, row.City, row.Status,
            row.Address, row.Date, row.Description, row.District, row.Email, row.Image1, row.Image2,
            row.Longitude, row.Latitude, row.Reason, row.Type
        );
    });
}

async function fetchAllComplaints() {
    var data = await fetchAllComplaintsAwait()
    showComplaints(data)
}

/** Generate SafeMe function ******************************************************************* */
function safeMeFunction(SID, Name, NIC, Contact, City, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address) {
    var htmlCard = `
<tr>
           <td><img src="${ProfileImage}" alt=""
           class="rounded-circle thumb-xs me-1"> ${Name}
           </td>
           <td>${NIC}</td>
           <td>${Contact}</td>
           <td>${SID}</td>
           <td>${City}</td>
           <td><span class="badge badge-outline-primary">${Severity}</span></td>
           <td><span class="badge badge-soft-warning">${Status}</span></td>
           <td class="text-end">
           <a href="safeMeReports.html" onclick="generateSafeMeReports('${SID}')" target="_blank" rel="noopener noreferrer"><i class="las dripicons-document text-secondary font-18"></i></a>
           </td>
           </tr>
`
    return htmlCard
}

function showSafeMe(cards) {
    safemeDom.renderRows(cardClass2, cards);
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

                cards.push(safeMeFunction(SID, Name, NIC, Contact, City, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address));
            }
        );
    });
    return cards
}

async function fetchAllSafeMe() {
    var data = await fetchAllSafeMeAwait()
    showSafeMe(data)
}
/**Generate safeME function ENDS *************************************************************** */

function generateComplaintReports(CID) {
    localStorage.setItem("ReportCID",CID);
}

function generateSafeMeReports(SID) {
    localStorage.setItem("ReportSID",SID);
}

if (cardClass) {
    fetchAllComplaints();
}
if (cardClass2) {
    fetchAllSafeMe();
}
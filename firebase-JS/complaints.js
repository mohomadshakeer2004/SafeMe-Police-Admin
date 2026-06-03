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

//Filter
var filtervalue = safemeDom.filterValue();

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
                     <a href="editAndViewComplaints.html" onclick="viewMore('${CID}','${Date}','${Longitude}','${Latitude}','${Type}')">
<!--                     <i class="las la-pen text-secondary font-18"></i></a>-->
                     
                       <button class="btn btn-primary btn-view"  type="button" text-secondary font-18" >View</button></a>
                     
                     
                     <a href="#" onclick="deleteComplaints('${CID}')"><i class="las la-trash-alt text-secondary icon "></i></a>
                </td>
          </tr>
           `
    return htmlCard
}

function showComplaints(cards) {
    safemeDom.renderRows(cardClass, cards);
}

async function fetchAllComplaintsAwait() {
    var cards = []

    var task = await firebase.database().ref('Complaints/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let CID = ChildSnapshot.val().CID;
                let City = ChildSnapshot.val().City;
                let Status = ChildSnapshot.val().Status;
                let Address = ChildSnapshot.val().Address;
                let Date = ChildSnapshot.val().Date;
                let Description = ChildSnapshot.val().Description;
                let District = ChildSnapshot.val().District;
                let Email = ChildSnapshot.val().Email;
                let Image1 = ChildSnapshot.val().Image1;
                let Image2 = ChildSnapshot.val().Image2;
                let Latitude = ChildSnapshot.val().Latitude;
                let Longitude = ChildSnapshot.val().Longitude;
                let Reason = ChildSnapshot.val().Reason;
                let Type = ChildSnapshot.val().Type;

                cards.push(generateComplaints(ProfileImage, Name, NIC, ContactNo, CID, City, Status, Address, Date, Description,
                    District, Email, Image1, Image2, Longitude, Latitude, Reason, Type));
            }
        );
    });
    return cards
}

async function fetchAllComplaints() {
    var data = await fetchAllComplaintsAwait()
    showComplaints(data)
}


/*******************************Delete Complaint *************************************** */
function deleteComplaints(CID) {
    Swal.fire({
        title: 'Are you sure you want to delete this complaint from database?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Delete Complaint!
            var db = firebase.database();
            var ref = db.ref();
            var survey = db.ref("Complaints/All");
            survey.child(CID).remove();
            location.reload();
        }
    })

}


/**Search function********************************************************************************** */
safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

async function searchAwait(searchString) {
    var cards = []

    var task = await firebase.database().ref('Complaints/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let CID = ChildSnapshot.val().CID;
                let City = ChildSnapshot.val().City;
                let Status = ChildSnapshot.val().Status;
                let Address = ChildSnapshot.val().Address;
                let Date = ChildSnapshot.val().Date;
                let Description = ChildSnapshot.val().Description;
                let District = ChildSnapshot.val().District;
                let Email = ChildSnapshot.val().Email;
                let Image1 = ChildSnapshot.val().Image1;
                let Image2 = ChildSnapshot.val().Image2;
                let Latitude = ChildSnapshot.val().Latitude;
                let Longitude = ChildSnapshot.val().Longitude;
                let Reason = ChildSnapshot.val().Reason;
                let Type = ChildSnapshot.val().Type;

                 if (Name.toLowerCase().includes(searchString) | NIC.toLowerCase().includes(searchString) |
                    City.toLowerCase().includes(searchString)) {
                    cards.push(generateComplaints(ProfileImage, Name, NIC, ContactNo, CID, City, Status, Address, Date, Description,
                        District, Email, Image1, Image2, Longitude, Latitude, Reason, Type));
                }
            }
        );
    });
    return cards
}

async function search(searchString) {

    var data = await searchAwait(searchString);
    showComplaints(data)
}

/*******************************Filter Function *************************************** */
function updateFilter() {
    filtervalue = safemeDom.filterValue();
}

async function filterAwait() {
    var cards4 = []

    var task = await firebase.database().ref('Complaints/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let CID = ChildSnapshot.val().CID;
                let City = ChildSnapshot.val().City;
                let Status = ChildSnapshot.val().Status;
                let Address = ChildSnapshot.val().Address;
                let Date = ChildSnapshot.val().Date;
                let Description = ChildSnapshot.val().Description;
                let District = ChildSnapshot.val().District;
                let Email = ChildSnapshot.val().Email;
                let Image1 = ChildSnapshot.val().Image1;
                let Image2 = ChildSnapshot.val().Image2;
                let Latitude = ChildSnapshot.val().Latitude;
                let Longitude = ChildSnapshot.val().Longitude;
                let Reason = ChildSnapshot.val().Reason;
                let Type = ChildSnapshot.val().Type;

                if (Status.includes(filtervalue)) {
                    cards4.push(generateComplaints(ProfileImage, Name, NIC, ContactNo, CID, City, Status, Address, Date, Description,
                        District, Email, Image1, Image2, Longitude, Latitude, Reason, Type));
                } else if (filtervalue === "All") {
                    cards4.push(generateComplaints(ProfileImage, Name, NIC, ContactNo, CID, City, Status, Address, Date, Description,
                        District, Email, Image1, Image2, Longitude, Latitude, Reason, Type));
                }

            }
        );

    });
    return cards4
}

async function filter() {

    var data4 = await filterAwait();
    showComplaints(data4);
}

/********************Passing values to second page***************************/
function viewMore(CID,Date,Longitude,Latitude,Type){
    localStorage.setItem("ComplaintCID",CID);
    localStorage.setItem("ComplaintDate",Date);
    localStorage.setItem("ComplaintLongitude",Longitude);
    localStorage.setItem("ComplaintLatitude",Latitude);
    localStorage.setItem("ComplaintType",Type);
};

if (cardClass) {
    fetchAllComplaints();
}
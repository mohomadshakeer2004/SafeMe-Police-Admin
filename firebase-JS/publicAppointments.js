
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
var cardClass = document.getElementById('appointment_table');

//Filter
var filtervalue = safemeDom.filterValue();

/**Generate Appointments function******************************************************************** */
function generateAppointments(ProfileImage, Name, NIC, ContactNo, AID, City, RequestedDate, Status) {
    var htmlCard = `
          <tr>
              <td><img src="${ProfileImage}" alt="" class="rounded-circle thumb-xs me-1"> ${Name}</td>
              <td>${NIC}</td>
              <td>${ContactNo}</td>
              <td>${AID}</td>
              <td>${City}</td>
              <td>${RequestedDate}</td>
              <td><span class="badge badge-soft-primary">${Status}</span></td>
              <td class="text-end">
              <span onclick="viewMore('${AID}')">
<!--<i class="las la-pen text-secondary font-18"></i>-->
                  <button class="btn btn-primary btn-view"  type="button" text-secondary " >View</button></span>
                  <span style="cursor: pointer" onclick="makePending('${AID}')"><i class="las ti-time text-secondary icon"></i></span>
                   <span style="cursor: pointer" onclick="deleteAppointments('${AID}')"><i class="las la-trash-alt text-secondary icon"></i></span>
              </td>
          </tr>
           `
    return htmlCard
}

function showAppointments(cards) {
    safemeDom.renderRows(cardClass, cards);
}

async function fetchAllAppointmentsAwait() {
    var cards = []

    var task = await firebase.database().ref('Appointments/PublicAppointments').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let AID = ChildSnapshot.val().AID;
                let City = ChildSnapshot.val().City;
                let RequestedDate = ChildSnapshot.val().RequestedDate;
                let Status = ChildSnapshot.val().ScheduledDate;

                cards.push(generateAppointments(ProfileImage, Name, NIC, ContactNo, AID, City, RequestedDate, Status));
            }
        );
    });
    return cards
}

async function fetchAllAppointments() {
    var data = await fetchAllAppointmentsAwait()
    showAppointments(data)
}
/*******************************Delete Complaint *************************************** */
function deleteAppointments(AID) {
    Swal.fire({
        title: 'Are you sure you want to delete this Appointment from database?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Delete Appointment!
            var db = firebase.database();
            var ref = db.ref();
            var survey = db.ref("Appointments/PublicAppointments");
            survey.child(AID).remove();
            location.reload();
        }
    })

}


/*******************************make a Complaint pending*************************************** */
function makePending(AID) {
    Swal.fire({
        title: 'Are you sure you want to make this Appointment pending?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, make it pending!'
    }).then((result) => {
        if (result.isConfirmed) {
            firebase.database().ref('Appointments/PublicAppointments/' + AID).update({
                ScheduledDate: "Pending"
            });
            location.reload();
        }
    })

}


/*******************************View More  *************************************** */
function viewMore(AID) {
    localStorage.setItem("publicAID", AID);
    location.replace("publicAppointmentsViewAndSchedule.html");
}


/**Search function**********************************************************************************/
safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

async function searchAwait(searchString) {
    var cards = []

    var task = await firebase.database().ref('Appointments/PublicAppointments').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let AID = ChildSnapshot.val().AID;
                let City = ChildSnapshot.val().City;
                let RequestedDate = ChildSnapshot.val().RequestedDate;
                let Status = ChildSnapshot.val().ScheduledDate;

                if (Name.toLowerCase().includes(searchString) | NIC.toLowerCase().includes(searchString) |
                    City.toLowerCase().includes(searchString)) {
                    cards.push(generateAppointments(ProfileImage, Name, NIC, ContactNo, AID, City, RequestedDate, Status));
                }
            }
        );
    });
    return cards
}

async function search(searchString) {

    var data = await searchAwait(searchString);
    showAppointments(data)
}

/*******************************Filter Function *************************************** */
function updateFilter() {
    filtervalue = safemeDom.filterValue();
}

async function filterAwait() {
    var cards4 = []

    var task = await firebase.database().ref('Appointments/PublicAppointments').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let AID = ChildSnapshot.val().AID;
                let City = ChildSnapshot.val().City;
                let RequestedDate = ChildSnapshot.val().RequestedDate;
                let Status = ChildSnapshot.val().ScheduledDate;
                if (Status.includes(filtervalue)) {
                    cards4.push(generateAppointments(ProfileImage, Name, NIC, ContactNo, AID, City, RequestedDate, Status));
                } else if (filtervalue === "All") {
                    cards4.push(generateAppointments(ProfileImage, Name, NIC, ContactNo, AID, City, RequestedDate, Status));
                }

            }
        );

    });
    return cards4
}

async function filter() {

    var data4 = await filterAwait();
    showAppointments(data4);
}

if (cardClass) {
    fetchAllAppointments();
}
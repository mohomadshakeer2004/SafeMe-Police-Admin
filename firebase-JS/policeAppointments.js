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
var cardClass = document.getElementById('appointment_table');

//Filter
var filtervalue = safemeDom.filterValue();

/** Generate Appointments function ******************************************************************* */
function generateAppointments(AID,NIC,ContactNo,Type,City,ScheduledDate,Status) {
    var htmlCard = `
             <tr>
                <td>${AID}</td>
                <td>${NIC}</td>
                <td>${ContactNo}</td>
                <td>${Type}</td>
                <td>${City}</td>
                <td>${ScheduledDate}</td>
                <td><span class="badge badge-soft-primary">${Status}</span></td>
                <td class="text-end">
                    <span style="cursor: pointer" onclick="updatePending('${AID}')"><i class="las ti-time text-secondary font-18"></i></span>
                    <span style="cursor: pointer" onclick="updateCompleted('${AID}')"><i class="las ti-check-box text-secondary font-18"></i></span>
                    <span style="cursor: pointer" onclick="deleteAppointments('${AID}')"><i class="las la-trash-alt text-secondary font-22"></i></span>
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

    var task = await firebase.database().ref('Appointments/PoliceAppointments').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let AID = ChildSnapshot.val().AIDP;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let Type = ChildSnapshot.val().Type;
                let City = ChildSnapshot.val().City;
                let ScheduledDate = ChildSnapshot.val().ScheduledDate;
                let Status = ChildSnapshot.val().Status;

                cards.push(generateAppointments(AID,NIC,ContactNo,Type,City,ScheduledDate,Status));
            }
        );
    });
    return cards
}

async function fetchAllAppointments() {
    var data = await fetchAllAppointmentsAwait()
    showAppointments(data)
}

/**Search function**********************************************************************************/
safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

async function searchAwait(searchString) {
    var cards = []

    var task = await firebase.database().ref('Appointments/PoliceAppointments').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let AID = ChildSnapshot.val().AIDP;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let Type = ChildSnapshot.val().Type;
                let City = ChildSnapshot.val().City;
                let ScheduledDate = ChildSnapshot.val().ScheduledDate;
                let Status = ChildSnapshot.val().Status;

                if (Type.toLowerCase().includes(searchString) | NIC.toLowerCase().includes(searchString) | City.toLowerCase().includes(searchString )) {
                    cards.push(generateAppointments(AID,NIC,ContactNo,Type,City,ScheduledDate,Status));
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

    var task = await firebase.database().ref('Appointments/PoliceAppointments').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {

                let AID = ChildSnapshot.val().AIDP;
                let NIC = ChildSnapshot.val().NIC;
                let ContactNo = ChildSnapshot.val().Mobile;
                let Type = ChildSnapshot.val().Type;
                let City = ChildSnapshot.val().City;
                let ScheduledDate = ChildSnapshot.val().ScheduledDate;
                let Status = ChildSnapshot.val().Status;

                if (Status.includes(filtervalue)) {
                    cards4.push(generateAppointments(AID,NIC,ContactNo,Type,City,ScheduledDate,Status));
                }else if(filtervalue === "All") {
                    cards4.push(generateAppointments(AID,NIC,ContactNo,Type,City,ScheduledDate,Status));
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

/*******************************Delete Appointment *************************************** */
function deleteAppointments(AIDP){
    Swal.fire({
        title: 'Are you sure you want to delete this Appointment from database?',
        text: "You won't be able to revert this!",
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(function (result) {
        if (!result.isConfirmed) {
            return;
        }
        var apptRef = firebase.database().ref('Appointments/PoliceAppointments/' + AIDP);
        var metaRef = firebase.database().ref('Appointments');

        apptRef
            .once('value')
            .then(function (snap) {
                if (!snap.exists()) {
                    throw new Error('Appointment not found');
                }
                return apptRef.remove();
            })
            .then(function () {
                return metaRef.once('value');
            })
            .then(function (snap) {
                var data = snap.val() || {};
                var current = Number(data.PoliceAppointmentCount) || 0;
                return metaRef.update({
                    PoliceAppointmentCount: Math.max(0, current - 1),
                });
            })
            .then(function () {
                return Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    text: 'Police appointment removed. Dashboard count updated.',
                    timer: 1400,
                    showConfirmButton: false,
                });
            })
            .then(function () {
                location.reload();
            })
            .catch(function (e) {
                console.error(e);
                Swal.fire({ icon: 'error', text: 'Could not delete appointment.' });
            });
    });
}
/*******************************Update Appointment End*************************************** */
function updateCompleted(AID) {
    Swal.fire({
        title: 'Mark as completed?',
        text: 'This police appointment will be marked Completed.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0c213a',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, update'
    }).then((result) => {
        if (!result.isConfirmed) {
            return;
        }
        firebase.database().ref('Appointments/PoliceAppointments/'+AID).update({
            Status:"Completed",
        }).then(function () {
            if (window.safemeUi) {
                return safemeUi.toastSuccess('Updated successfully', 'Appointment marked as Completed.');
            }
            return Swal.fire({ icon: 'success', title: 'Updated successfully', text: 'Appointment marked as Completed.' });
        }).then(function () {
            location.reload();
        }).catch(function (e) {
            console.error(e);
            Swal.fire({ icon: 'error', text: 'Update failed.' });
        });
    })
}

function updatePending(AID) {
    Swal.fire({
        title: 'Mark as pending?',
        text: 'This police appointment will be marked Pending.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0c213a',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, update'
    }).then((result) => {
        if (!result.isConfirmed) {
            return;
        }
        firebase.database().ref('Appointments/PoliceAppointments/'+AID).update({
            Status:"Pending",
        }).then(function () {
            if (window.safemeUi) {
                return safemeUi.toastSuccess('Updated successfully', 'Appointment marked as Pending.');
            }
            return Swal.fire({ icon: 'success', title: 'Updated successfully', text: 'Appointment marked as Pending.' });
        }).then(function () {
            location.reload();
        }).catch(function (e) {
            console.error(e);
            Swal.fire({ icon: 'error', text: 'Update failed.' });
        });
    })
}
if (cardClass) {
    fetchAllAppointments();
}
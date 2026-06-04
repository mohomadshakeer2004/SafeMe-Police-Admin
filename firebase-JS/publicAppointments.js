
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

function rowToCard(row) {
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
}

async function fetchAllAppointmentsAwait() {
    var rows = await SafeMeAppointments.fetchAllPublicAppointmentsMerged();
    return rows.map(rowToCard);
}

async function fetchAllAppointments() {
    var data = await fetchAllAppointmentsAwait()
    showAppointments(data)
}

function deleteAppointments(AID) {
    Swal.fire({
        title: 'Are you sure you want to delete this Appointment from database?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await SafeMeAppointments.deletePublicAppointmentEverywhere(AID);
                location.reload();
            } catch (e) {
                console.error(e);
                Swal.fire({ icon: 'error', text: 'Delete failed.' });
            }
        }
    })
}

function makePending(AID) {
    Swal.fire({
        title: 'Are you sure you want to make this Appointment pending?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, make it pending!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await SafeMeAppointments.updatePublicAppointmentEverywhere(AID, {
                    ScheduledDate: 'Pending',
                });
                location.reload();
            } catch (e) {
                console.error(e);
                Swal.fire({ icon: 'error', text: 'Update failed.' });
            }
        }
    })
}

function viewMore(AID) {
    localStorage.setItem("publicAID", AID);
    location.replace("publicAppointmentsViewAndSchedule.html");
}

safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

async function searchAwait(searchString) {
    var rows = await SafeMeAppointments.fetchAllPublicAppointmentsMerged();
    return rows
        .filter(function (row) {
            var name = (row.Name || '').toLowerCase();
            var nic = (row.NIC || '').toLowerCase();
            var city = (row.City || '').toLowerCase();
            return (
                name.includes(searchString) ||
                nic.includes(searchString) ||
                city.includes(searchString)
            );
        })
        .map(rowToCard);
}

async function search(searchString) {
    var data = await searchAwait(searchString);
    showAppointments(data)
}

function updateFilter() {
    filtervalue = safemeDom.filterValue();
}

async function filterAwait() {
    var rows = await SafeMeAppointments.fetchAllPublicAppointmentsMerged();
    return rows
        .filter(function (row) {
            var status = row.ScheduledDate || '';
            if (filtervalue === 'All') {
                return true;
            }
            return status.includes(filtervalue);
        })
        .map(rowToCard);
}

async function filter() {
    var data4 = await filterAwait();
    showAppointments(data4);
}

if (cardClass) {
    fetchAllAppointments();
}

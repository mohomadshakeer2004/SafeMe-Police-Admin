(function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // signed in
        } else {
            window.location.replace('index.html');
        }
    });
})();

var cardClass = document.getElementById('appointment_table');
var filtervalue = safemeDom.filterValue();

var CANCEL_FINE_DEFAULT = 500;

function appointmentStatus(row) {
    var status = (row.Status || '').trim();
    if (status) {
        return status;
    }
    return 'Active';
}

function statusBadgeClass(status) {
    var s = (status || '').toLowerCase();
    if (s.indexOf('cancel requested') !== -1) {
        return 'badge-soft-warning';
    }
    if (s.indexOf('cancelled') !== -1) {
        return 'badge-soft-danger';
    }
    if (s.indexOf('pending') !== -1) {
        return 'badge-soft-primary';
    }
    return 'badge-soft-success';
}

function generateAppointments(row) {
    var status = appointmentStatus(row);
    var fine = row.CancelFineAmount != null ? row.CancelFineAmount : '';
    var isCancelRequested = status.toLowerCase().indexOf('cancel requested') !== -1;
    var fineHtml = isCancelRequested
        ? `<div class="small text-warning mt-1">Fine: Rs. ${fine || CANCEL_FINE_DEFAULT}</div>`
        : status.toLowerCase() === 'cancelled' && fine
          ? `<div class="small text-muted mt-1">Fine: Rs. ${fine}</div>`
          : '';

    var cancelActions = isCancelRequested
        ? `
          <button class="btn btn-sm btn-success me-1" type="button" title="Approve cancel (apply fine)"
                  onclick="approveCancel('${row.AID}')">Approve Cancel</button>
          <button class="btn btn-sm btn-outline-secondary me-1" type="button" title="Reject cancel request"
                  onclick="rejectCancel('${row.AID}')">Reject</button>`
        : '';

    return `
          <tr>
              <td><img src="${row.ProfileImage || ''}" alt="" class="rounded-circle thumb-xs me-1"> ${row.Name || ''}</td>
              <td>${row.NIC || ''}</td>
              <td>${row.Mobile || ''}</td>
              <td>${row.AID || ''}</td>
              <td>${row.City || ''}</td>
              <td>${row.RequestedDate || ''}</td>
              <td>${row.ScheduledDate || ''}</td>
              <td>
                <span class="badge ${statusBadgeClass(status)}">${status}</span>
                ${fineHtml}
              </td>
              <td class="text-end">
              <span onclick="viewMore('${row.AID}')">
                  <button class="btn btn-primary btn-view" type="button">View</button></span>
                  ${cancelActions}
                  <span style="cursor: pointer" onclick="makePending('${row.AID}')"><i class="las ti-time text-secondary icon"></i></span>
                   <span style="cursor: pointer" onclick="deleteAppointments('${row.AID}')"><i class="las la-trash-alt text-secondary icon"></i></span>
              </td>
          </tr>
           `;
}

function showAppointments(cards) {
    safemeDom.renderRows(cardClass, cards);
}

function rowToCard(row) {
    return generateAppointments(row);
}

async function fetchAllAppointmentsAwait() {
    var rows = await SafeMeAppointments.fetchAllPublicAppointmentsMerged();
    return rows.map(rowToCard);
}

async function fetchAllAppointments() {
    var data = await fetchAllAppointmentsAwait();
    showAppointments(data);
}

function deleteAppointments(AID) {
    Swal.fire({
        title: 'Are you sure you want to delete this Appointment from database?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
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
    });
}

function makePending(AID) {
    Swal.fire({
        title: 'Are you sure you want to make this Appointment pending?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, make it pending!',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await SafeMeAppointments.updatePublicAppointmentEverywhere(AID, {
                    ScheduledDate: 'Pending',
                });
                if (window.safemeUi) {
                    await safemeUi.toastSuccess('Updated successfully', 'Appointment set to Pending.');
                } else {
                    await Swal.fire({ icon: 'success', title: 'Updated successfully', text: 'Appointment set to Pending.' });
                }
                location.reload();
            } catch (e) {
                console.error(e);
                Swal.fire({ icon: 'error', text: 'Update failed.' });
            }
        }
    });
}

/** Approve citizen cancel request — matches mobile fine scenario (Rs. 500). */
function approveCancel(AID) {
    Swal.fire({
        title: 'Approve cancellation?',
        html:
            'Citizen requested cancel with a <strong>Rs. ' +
            CANCEL_FINE_DEFAULT +
            '</strong> fine (same as SafeMe app).<br>Status will become <strong>Cancelled</strong>.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Approve & apply fine',
    }).then(async (result) => {
        if (!result.isConfirmed) {
            return;
        }
        try {
            var found = await SafeMeAppointments.findPublicAppointmentByAid(AID);
            var fine =
                found &&
                found.data &&
                found.data.CancelFineAmount != null
                    ? found.data.CancelFineAmount
                    : CANCEL_FINE_DEFAULT;
            await SafeMeAppointments.updatePublicAppointmentEverywhere(AID, {
                Status: 'Cancelled',
                CancelFineAmount: fine,
                CancelApprovedDate: new Date().toISOString(),
                ScheduledDate: 'Cancelled',
            });
            Swal.fire({
                icon: 'success',
                text: 'Cancellation approved. Fine Rs. ' + fine + ' recorded.',
            }).then(function () {
                location.reload();
            });
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: 'error', text: 'Approve failed.' });
        }
    });
}

/** Reject cancel request — appointment stays active; fine cleared. */
function rejectCancel(AID) {
    Swal.fire({
        title: 'Reject cancellation request?',
        text: 'Appointment stays active. Fine will not apply.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Reject request',
    }).then(async (result) => {
        if (!result.isConfirmed) {
            return;
        }
        try {
            await SafeMeAppointments.updatePublicAppointmentEverywhere(AID, {
                Status: 'Active',
                CancelFineAmount: null,
                CancelRequestedDate: null,
                CancelRejectedDate: new Date().toISOString(),
            });
            Swal.fire({
                icon: 'success',
                text: 'Cancellation request rejected.',
            }).then(function () {
                location.reload();
            });
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: 'error', text: 'Reject failed.' });
        }
    });
}

function viewMore(AID) {
    localStorage.setItem('publicAID', AID);
    window.location.href = 'publicAppointmentsViewAndSchedule.html';
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
            var status = appointmentStatus(row).toLowerCase();
            return (
                name.includes(searchString) ||
                nic.includes(searchString) ||
                city.includes(searchString) ||
                status.includes(searchString)
            );
        })
        .map(rowToCard);
}

async function search(searchString) {
    var data = await searchAwait(searchString);
    showAppointments(data);
}

function updateFilter() {
    filtervalue = safemeDom.filterValue();
}

async function filterAwait() {
    var rows = await SafeMeAppointments.fetchAllPublicAppointmentsMerged();
    return rows
        .filter(function (row) {
            if (filtervalue === 'All') {
                return true;
            }
            if (filtervalue === 'Cancel Requested') {
                return (
                    appointmentStatus(row).toLowerCase().indexOf('cancel requested') !==
                    -1
                );
            }
            if (filtervalue === 'Cancelled') {
                return appointmentStatus(row).toLowerCase() === 'cancelled';
            }
            if (filtervalue === 'Pending') {
                return (row.ScheduledDate || '').indexOf('Pending') !== -1;
            }
            return (
                (row.ScheduledDate || '').includes(filtervalue) ||
                appointmentStatus(row).includes(filtervalue)
            );
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

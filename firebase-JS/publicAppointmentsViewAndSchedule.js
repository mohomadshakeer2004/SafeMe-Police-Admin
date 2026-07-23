(function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // signed in
        } else {
            window.location.replace('index.html');
        }
    });
})();

var AIDFromPrevoiusPage;
var resolvedPublicAppointment = null;
var CANCEL_FINE_DEFAULT = 500;

AIDFromPrevoiusPage = localStorage.getItem('publicAID');
safemeDom.setValue('pub-aid', AIDFromPrevoiusPage);

function applyPublicAppointmentToForm(d) {
    if (!d) {
        return;
    }
    safemeDom.setValue('pub-name', d.Name);
    safemeDom.setValue('pub-nic', d.NIC);
    safemeDom.setValue('pub-telephone', d.Mobile);
    safemeDom.setValue('pub-email', d.Email);
    safemeDom.setValue('pub-address', d.Address);
    safemeDom.setValue('pub-city', d.City);
    safemeDom.setValue('pub-district', d.District);
    safemeDom.setValue('pub-type', d.Type);
    safemeDom.setValue('pub-requested-date', d.RequestedDate);
    safemeDom.setValue('pub-description', d.Description);
    safemeDom.setSrc('pub-img', d.ProfileImage);

    var status = (d.Status || '').trim() || 'Active';
    safemeDom.setValue('pub-status', status);

    var fineRow = document.getElementById('pub-fine-row');
    var cancelActions = document.getElementById('pub-cancel-actions');
    var fine = d.CancelFineAmount != null ? d.CancelFineAmount : CANCEL_FINE_DEFAULT;
    var isCancelRequested =
        status.toLowerCase().indexOf('cancel requested') !== -1;
    var isCancelled = status.toLowerCase() === 'cancelled';

    if (isCancelRequested || isCancelled) {
        if (fineRow) {
            fineRow.style.display = '';
        }
        safemeDom.setValue(
            'pub-fine',
            'Rs. ' + fine + (isCancelRequested ? ' (pending approval)' : ' (applied)')
        );
    } else if (fineRow) {
        fineRow.style.display = 'none';
    }

    if (cancelActions) {
        cancelActions.style.display = isCancelRequested ? '' : 'none';
    }
}

async function setDetails() {
    if (!AIDFromPrevoiusPage) {
        return;
    }
    resolvedPublicAppointment = await SafeMeAppointments.findPublicAppointmentByAid(
        AIDFromPrevoiusPage
    );
    if (!resolvedPublicAppointment || !resolvedPublicAppointment.data) {
        console.warn('Public appointment not found:', AIDFromPrevoiusPage);
        return;
    }
    applyPublicAppointmentToForm(resolvedPublicAppointment.data);
    if (resolvedPublicAppointment.primaryPath) {
        firebase
            .database()
            .ref(resolvedPublicAppointment.primaryPath)
            .on('value', function (snapshot) {
                applyPublicAppointmentToForm(snapshot.val());
            });
    }
}

setDetails();

async function update() {
    var scheduled = safemeDom.get('pub-sheduled-date')
        ? safemeDom.get('pub-sheduled-date').value
        : '';
    if (!scheduled) {
        if (window.safemeUi) {
            safemeUi.toastWarn('Schedule date required', 'Please pick a schedule date.');
        } else {
            Swal.fire({ icon: 'warning', text: 'Please pick a schedule date.' });
        }
        return;
    }
    try {
        await SafeMeAppointments.updatePublicAppointmentEverywhere(
            AIDFromPrevoiusPage,
            {
                ScheduledDate: scheduled,
            }
        );
        if (window.safemeUi) {
            await safemeUi.updatedThen(
                'Appointment scheduled for ' + scheduled + '.',
                'publicAppointments.html'
            );
        } else {
            await Swal.fire({
                icon: 'success',
                title: 'Updated successfully',
                text: 'Date Updated!',
            });
            window.location.href = 'publicAppointments.html';
        }
    } catch (e) {
        console.error(e);
        if (window.safemeUi) {
            safemeUi.toastError('Update failed', 'Could not update schedule date.');
        } else {
            Swal.fire({ icon: 'error', text: 'Update failed.' });
        }
    }
}

async function approveCancelFromDetail() {
    var result = await Swal.fire({
        title: 'Approve cancellation?',
        html:
            'Apply <strong>Rs. ' +
            CANCEL_FINE_DEFAULT +
            '</strong> fine (matches SafeMe citizen app) and set status to Cancelled.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Approve & apply fine',
    });
    if (!result.isConfirmed) {
        return;
    }
    try {
        var found = await SafeMeAppointments.findPublicAppointmentByAid(
            AIDFromPrevoiusPage
        );
        var fine =
            found && found.data && found.data.CancelFineAmount != null
                ? found.data.CancelFineAmount
                : CANCEL_FINE_DEFAULT;
        await SafeMeAppointments.updatePublicAppointmentEverywhere(
            AIDFromPrevoiusPage,
            {
                Status: 'Cancelled',
                CancelFineAmount: fine,
                CancelApprovedDate: new Date().toISOString(),
                ScheduledDate: 'Cancelled',
            }
        );
        Swal.fire({
            icon: 'success',
            text: 'Cancellation approved. Fine Rs. ' + fine + ' recorded.',
        }).then(function () {
            window.location.href = 'publicAppointments.html';
        });
    } catch (e) {
        console.error(e);
        Swal.fire({ icon: 'error', text: 'Approve failed.' });
    }
}

async function rejectCancelFromDetail() {
    var result = await Swal.fire({
        title: 'Reject cancellation?',
        text: 'Appointment stays active. Fine will not apply.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Reject request',
    });
    if (!result.isConfirmed) {
        return;
    }
    try {
        await SafeMeAppointments.updatePublicAppointmentEverywhere(
            AIDFromPrevoiusPage,
            {
                Status: 'Active',
                CancelFineAmount: null,
                CancelRequestedDate: null,
                CancelRejectedDate: new Date().toISOString(),
            }
        );
        Swal.fire({
            icon: 'success',
            text: 'Cancellation request rejected.',
        }).then(function () {
            window.location.href = 'publicAppointments.html';
        });
    } catch (e) {
        console.error(e);
        Swal.fire({ icon: 'error', text: 'Reject failed.' });
    }
}

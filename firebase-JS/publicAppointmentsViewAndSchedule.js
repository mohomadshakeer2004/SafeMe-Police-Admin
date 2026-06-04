
(function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
        } else {
            window.location.replace("index.html");
        }
    });
})();

var AIDFromPrevoiusPage;
var resolvedPublicAppointment = null;

AIDFromPrevoiusPage = localStorage.getItem("publicAID");
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
        firebase.database().ref(resolvedPublicAppointment.primaryPath).on('value', function (snapshot) {
            applyPublicAppointmentToForm(snapshot.val());
        });
    }
}

setDetails();

async function update() {
    var scheduled =
        safemeDom.get('pub-sheduled-date') ? safemeDom.get('pub-sheduled-date').value : '';
    try {
        await SafeMeAppointments.updatePublicAppointmentEverywhere(AIDFromPrevoiusPage, {
            ScheduledDate: scheduled,
        });
        Swal.fire({
            icon: 'success',
            text: 'Date Updated!',
        }).then(function () {
            location.replace("publicAppointments.html");
        });
    } catch (e) {
        console.error(e);
        Swal.fire({ icon: 'error', text: 'Update failed.' });
    }
}

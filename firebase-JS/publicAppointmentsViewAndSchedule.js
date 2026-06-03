
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

var AIDFromPrevoiusPage;

AIDFromPrevoiusPage = localStorage.getItem("publicAID");
safemeDom.setValue('pub-aid', AIDFromPrevoiusPage);

function setDetails() {
    if (!AIDFromPrevoiusPage) {
        return;
    }
    firebase.database().ref('Appointments/PublicAppointments/' + AIDFromPrevoiusPage).on('value', function (snapshot) {
        var d = snapshot.val();
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
    });
}

setDetails();

function update() {
    /**updating the last ID in DB */
    firebase.database().ref('Appointments/PublicAppointments/'+AIDFromPrevoiusPage).update({
        ScheduledDate: safemeDom.get('pub-sheduled-date') ? safemeDom.get('pub-sheduled-date').value : '',
    });
    Swal.fire({
        icon: 'success',
        text: 'Date Updated!',
    }).then((result)=>{
        location.replace("publicAppointments.html");
    })

}


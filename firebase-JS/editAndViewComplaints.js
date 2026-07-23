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

/***************Getting the values from previous page******************/
var CIDFromPrevoiusPage;

CIDFromPrevoiusPage = localStorage.getItem("ComplaintCID");
safemeDom.setHtml('cid', CIDFromPrevoiusPage);

var resolvedComplaint = null;

function applyComplaintToForm(d) {
    if (!d) {
        return;
    }
    var media = window.safemeMedia;
    if (media) {
        media.setImg('profilePic', d.ProfileImage, { placeholder: media.PLACEHOLDER });
        media.renderEvidenceGallery(
            'evidence-gallery',
            [d.Image1, d.Image2],
            'evidence-empty'
        );
        // Keep legacy hidden imgs in sync
        media.bindEvidenceSlot('evidence1', d.Image1);
        media.bindEvidenceSlot('evidence2', d.Image2);
    } else {
        safemeDom.setSrc('profilePic', d.ProfileImage);
        safemeDom.setSrc('evidence1', d.Image1);
        safemeDom.setSrc('evidence2', d.Image2);
    }
    safemeDom.setValue('name', d.Name);
    safemeDom.setValue('number', d.Mobile);
    safemeDom.setValue('address', d.Address);
    safemeDom.setValue('district', d.District);
    safemeDom.setValue('cid', d.CID);
    safemeDom.setValue('type', d.Type);
    safemeDom.setValue('date', d.Date);
    safemeDom.setValue('nic', d.NIC);
    safemeDom.setValue('email', d.Email);
    safemeDom.setValue('city', d.City);
    safemeDom.setValue('description', d.Description);
    safemeDom.setValue('policeNote', d.PoliceNote);
    safemeDom.setValue('complaint-name', d.Name);
    safemeDom.setValue('complaint-ID', CIDFromPrevoiusPage);
    safemeDom.setValue('complaint-email', d.Email);
    safemeDom.setValue('complaint-comment', d.PoliceNote);
    if (d.NIC) {
        localStorage.setItem('ComplaintNIC', d.NIC);
    }
    var titleEl = document.getElementById('evidence-card-title');
    if (titleEl) {
        titleEl.textContent =
            d.Type === 'Lost And Found'
                ? 'Lost & Found evidence photos'
                : 'Complaint evidence photos';
    }
}

/**Getting the details from DB and setting it in the text field*/
async function setDetails() {
    if (!CIDFromPrevoiusPage) {
        return;
    }
    resolvedComplaint = await SafeMeComplaints.findComplaintByCid(CIDFromPrevoiusPage);
    if (!resolvedComplaint || !resolvedComplaint.data) {
        console.warn('Complaint not found:', CIDFromPrevoiusPage);
        return;
    }
    applyComplaintToForm(resolvedComplaint.data);

    if (resolvedComplaint.primaryPath) {
        firebase.database().ref(resolvedComplaint.primaryPath).on('value', function (snapshot) {
            applyComplaintToForm(snapshot.val());
        });
    }
}

setDetails();

var DefaultMessage = "Complaint is on Ongoing Stage";
var PendingMessage = "Complaint is on Pending Stage";

async function applyStatusUpdate(statVal, pNote) {
    var updates = { Status: statVal };
    if (statVal == "Ongoing") {
        updates.PoliceNote = DefaultMessage;
    } else if (statVal == "Closed") {
        updates.PoliceNote = pNote;
    } else {
        updates.PoliceNote = PendingMessage;
    }
    await SafeMeComplaints.updateComplaintEverywhere(
        CIDFromPrevoiusPage,
        updates
    );
}

//Update Function
function updateComplaint() {
    var filterEl = document.getElementById('filterList');
    var noteEl = document.getElementById('policeNote');
    if (!filterEl) {
        return;
    }
    var statVal = filterEl.value;
    var pNote = noteEl ? noteEl.value : '';

    if (statVal == "Select status") {
        if (window.safemeUi) {
            safemeUi.toastWarn('Select a status', 'Please choose a complaint status before updating.');
        } else {
            Swal.fire({ icon: 'warning', text: 'Please select a status!' });
        }
        return;
    }

    if (statVal == "Closed" && pNote == "") {
        if (window.safemeUi) {
            safemeUi.toastWarn('Police note required', 'Please enter a police note to close this complaint.');
        } else {
            Swal.fire({ icon: 'warning', text: 'Please enter a police note to continue' });
        }
        return;
    }

    applyStatusUpdate(statVal, pNote)
        .then(function () {
            if (window.safemeUi) {
                return safemeUi.toastSuccess(
                    'Complaint updated',
                    'Status changed to "' + statVal + '".'
                );
            }
            return Swal.fire({
                icon: 'success',
                title: 'Updated successfully',
                text: 'Status changed to "' + statVal + '".',
            });
        })
        .catch(function (e) {
            console.error(e);
            if (window.safemeUi) {
                safemeUi.toastError('Update failed', 'Could not update complaint status.');
            } else {
                Swal.fire({ icon: 'error', text: 'Could not update complaint status.' });
            }
        });
}

//setting up the variables and get values from fields
const form = document.querySelector(".contact-form");
var select = document.getElementById('complaint-status');
var status = select.options[select.selectedIndex].value;
form.addEventListener("submit", e => {

    e.preventDefault();
    let name = document.querySelector(".name").value;
    let email = document.querySelector(".email").value;
    let status = document.querySelector(".status").value;
    let id = document.querySelector(".id").value;
    let comment = document.querySelector(".comment").value;

    //Validations
    if (status == "status")
    {
        Swal.fire({
            icon: 'warning',
            text: 'Please select the current status',
        })
        return;
    }
    if (comment == ""){
        Swal.fire({
            icon: 'warning',
            text: 'Please enter a police note',
        })
        return;
    }

    sendEmail(name,email,status,id,comment);
})
//Sending email
function sendEmail(name, email, status, id, comment) {
    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "canukaanurudda@gmail.com",
        Password: "D8C5B43F0DE9D4D1E9D48A29CA089CDC1A5B",
        To: `${email}`,
        From: "canukaanurudda@gmail.com",
        Subject: `${name} Just updated your complaint inquire status`,
        Body: `Name: ${name} <br> Email: ${email} <br> Status: ${status} <br> ComplaintID: ${id} <br> Comments : ${comment}`,
    }).then((success) => {
        Swal.fire({
            icon: 'success',
            text: 'Status Updated and message sent successfully.',
        }).then(()=>{
            location.href = "complaints.html";
        })
        return;
    }).catch((error) => {
        Swal.fire({
            icon: 'error',
            text: 'error sending message.',
        }).then(()=>{
            location.href = "complaints.html";
        })
        return;
    })
}



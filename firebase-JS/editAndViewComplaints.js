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

/**Getting the details from DB and setting it in the text field*/
function setDetails() {
    if (!CIDFromPrevoiusPage) {
        return;
    }
    firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).on('value', function (snapshot) {
        var d = snapshot.val();
        if (!d) {
            return;
        }
        safemeDom.setSrc('profilePic', d.ProfileImage);
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
        safemeDom.setSrc('evidence1', d.Image1);
        safemeDom.setSrc('evidence2', d.Image2);
        safemeDom.setValue('policeNote', d.PoliceNote);
        safemeDom.setValue('complaint-name', d.Name);
        safemeDom.setValue('complaint-ID', CIDFromPrevoiusPage);
        safemeDom.setValue('complaint-email', d.Email);
        safemeDom.setValue('complaint-comment', d.PoliceNote);
    });
}

setDetails();

var DefaultMessage = "Complaint is on Ongoing Stage";
var PendingMessage = "Complaint is on Pending Stage";

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
        Swal.fire({
            icon: 'warning',
            text: 'Please select a status!',
        }).then(()=>{
            location.reload();
        })
        return;

        return;
    } else {
        if (statVal == "Ongoing") {
            /**updating the Status*/
            firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).update({
                Status: statVal,
            });

            /**updating the Police Note*/
            firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).update({
                PoliceNote: DefaultMessage,
            });

        } else if (statVal == "Closed") {
            if (pNote == "") {
                Swal.fire({
                    icon: 'warning',
                    text: 'Please enter a police note to continue',
                })
            } else {
                /**updating the Status*/
                firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).update({
                    Status: statVal,
                });

                /**updating the Police Note*/
                firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).update({
                    PoliceNote: pNote,
                });

            }

        } else {
            /**updating the Status*/
            firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).update({
                Status: statVal,
            });

            /**updating the Police Note*/
            firebase.database().ref('Complaints/All/' + CIDFromPrevoiusPage).update({
                PoliceNote: PendingMessage,
            });
        }

    }

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



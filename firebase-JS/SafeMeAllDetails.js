/*******************************Get values for safme page*************************************** */
var ID = localStorage.getItem("SafeMeID");
var Name = localStorage.getItem("SafeMeName");
var Nic = localStorage.getItem("SafeMeNIC");
var MobileNumber = localStorage.getItem("SafeMeContact");
var City = localStorage.getItem("SafeMeCity");
var Status = localStorage.getItem("SafeMeStatus");
var ProfileImage = localStorage.getItem("SafeMeProfileImage");
var Audio = localStorage.getItem("SafeMeAudio");
var Image1 = localStorage.getItem("SafeMeImage1");
var Image2 = localStorage.getItem("SafeMeImage2");
var Image3 = localStorage.getItem("SafeMeImage3");
var Image4 = localStorage.getItem("SafeMeImage4");
var Image5 = localStorage.getItem("SafeMeImage5");
var District = localStorage.getItem("SafeMeDistrict");
var Email = localStorage.getItem("SafeMeEmail");
var Address = localStorage.getItem("SafeMeAddress");

/*******************************Setting the values for fields*************************************** */
function populateSafeMeDetailFields() {
    safemeDom.setHtml('name', Name);
    safemeDom.setHtml('number', MobileNumber);
    safemeDom.setHtml('nic', Nic);
    safemeDom.setHtml('city', City);
    safemeDom.setHtml('email', Email);
    safemeDom.setHtml('district', District);
    safemeDom.setHtml('address', Address);
    safemeDom.setHtml('status-dropdown', Status);
    safemeDom.setSrc('evidence1', Image1);
    safemeDom.setSrc('evidence2', Image2);
    safemeDom.setSrc('evidence3', Image3);
    safemeDom.setSrc('evidence4', Image4);
    safemeDom.setSrc('evidence5', Image5);
    if (Audio) {
        safemeDom.setSrc('audio', Audio);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateSafeMeDetailFields);
} else {
    populateSafeMeDetailFields();
}


//Set the Profile Image
var image = new Image();
image.onload = function () {
    document.getElementById('profilePic').setAttribute('src', this.src);
};
image.src = `${ProfileImage}`;

//Set the evidence images into carousel
var evidenceImage1 = new Image();
evidenceImage1.onload = function () {
    document.getElementById('evidence1').setAttribute('src', this.src);
};
evidenceImage1.src = `${Image1}`;

var evidenceImage2 = new Image();
evidenceImage2.onload = function () {
    document.getElementById('evidence2').setAttribute('src', this.src);
};
evidenceImage2.src = `${Image2}`;

var evidenceImage3 = new Image();
evidenceImage3.onload = function () {
    document.getElementById('evidence3').setAttribute('src', this.src);
};
evidenceImage3.src = `${Image3}`;

var evidenceImage4 = new Image();
evidenceImage4.onload = function () {
    document.getElementById('evidence4').setAttribute('src', this.src);
};
evidenceImage4.src = `${Image4}`;

var evidenceImage5 = new Image();
evidenceImage5.onload = function () {
    document.getElementById('evidence5').setAttribute('src', this.src);
};
evidenceImage5.src = `${Image5}`;

//Set the audio evidence
var audio = document.getElementById('audio');
audio.src=`${Audio}` + document.getElementById('audio').getAttribute('data-value');
audio.load();
/******************************* Setting the values for fields*************************************** */

var countFromDB;
/****************** getting the count from Database *********************/
function getCount() {
    firebase.database().ref('SafeMe').on('value',function(snapshot){
        countFromDB = (snapshot.val().PendingCount);
    });
}

/****************** Update Function *********************/

function update(){
    var filterEl = document.getElementById('filterList');
    if (!filterEl) {
        return;
    }
    var statVal = filterEl.value;

        /**updating the Status*/
        firebase.database().ref('SafeMe/All/'+ID).update({
            Status:statVal,
        });
        if(statVal.includes("Action Taken")){
            /**Updating the Pending count*/
            firebase.database().ref('SafeMe').update({
                PendingCount:countFromDB-1,
            });
        }

}


/**************************** Email sending function **********************************/
//setting up the variables and get values from fields
const form = document.querySelector(".contact-form");
var select = document.getElementById('safe-me-status');
var status = select.options[select.selectedIndex].value;

//pass database values to fields
safemeDom.setValue('email-name', Name);
safemeDom.setValue('safe-me-email', Email);
safemeDom.setValue('safe-me-ID', ID);
safemeDom.setValue('safe-me-comment', '');
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
        });
        return;
    }
    if (comment == ""){
        Swal.fire({
            icon: 'warning',
            text: 'Please enter a comment',
        });
        return;
    }

    sendEmail(name,email,status,id,comment);
})
//Sending email
function sendEmail(name, email,status,id,comment){
    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "canukaanurudda@gmail.com",
        Password: "D8C5B43F0DE9D4D1E9D48A29CA089CDC1A5B",
        To: `${email}`,
        From: "canukaanurudda@gmail.com",
        Subject: `${name} Just updated your safe me inquire status`,
        Body: `Name: ${name} <br> Email: ${email} <br> Status: ${status} <br> SafeMeID: ${id} <br> Comments : ${comment}`,
    }).then((success) => {
        Swal.fire({
            icon: 'success',
            text: 'Status Updated and message sent successfully.',
        }).then((result) => {
            location.href = "safeMe.html";
        });

    }).catch((error) => {
        Swal.fire({
            icon: 'error',
            text: 'Failed sending message',
        }).then((result) => {
            location.href = "safeMe.html";
        });
    })
}

getCount();
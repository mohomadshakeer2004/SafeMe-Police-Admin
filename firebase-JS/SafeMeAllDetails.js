/*******************************Get values for safme page*************************************** */
var ID = localStorage.getItem('SafeMeID');
var Name = localStorage.getItem('SafeMeName');
var Nic = localStorage.getItem('SafeMeNIC');
var MobileNumber = localStorage.getItem('SafeMeContact');
var City = localStorage.getItem('SafeMeCity');
var Status = localStorage.getItem('SafeMeStatus');
var ProfileImage = localStorage.getItem('SafeMeProfileImage');
var Audio = localStorage.getItem('SafeMeAudio');
var Image1 = localStorage.getItem('SafeMeImage1');
var Image2 = localStorage.getItem('SafeMeImage2');
var Image3 = localStorage.getItem('SafeMeImage3');
var Image4 = localStorage.getItem('SafeMeImage4');
var Image5 = localStorage.getItem('SafeMeImage5');
var District = localStorage.getItem('SafeMeDistrict');
var Email = localStorage.getItem('SafeMeEmail');
var Address = localStorage.getItem('SafeMeAddress');

function applySafeMeMedia(d) {
    if (!d) {
        return;
    }
    var media = window.safemeMedia;
    if (!media) {
        return;
    }
    media.setImg('profilePic', d.ProfileImage, {
        placeholder: media.PLACEHOLDER,
    });
    media.bindEvidenceSlot('evidence1', d.Image1);
    media.bindEvidenceSlot('evidence2', d.Image2);
    media.bindEvidenceSlot('evidence3', d.Image3);
    media.bindEvidenceSlot('evidence4', d.Image4);
    media.bindEvidenceSlot('evidence5', d.Image5);
    media.setAudio('audio', d.AudioMP3 || d.Audio);
}

function applySafeMeFields(d) {
    if (!d) {
        return;
    }
    Name = d.Name || Name;
    Nic = d.NIC || Nic;
    MobileNumber = d.Mobile != null ? d.Mobile : MobileNumber;
    City = d.City || City;
    Status = d.Status || Status;
    ProfileImage = d.ProfileImage || ProfileImage;
    Audio = d.AudioMP3 || d.Audio || Audio;
    Image1 = d.Image1 || Image1;
    Image2 = d.Image2 || Image2;
    Image3 = d.Image3 || Image3;
    Image4 = d.Image4 || Image4;
    Image5 = d.Image5 || Image5;
    District = d.District || District;
    Email = d.Email || Email;
    Address = d.Address || Address;

    safemeDom.setHtml('name', Name);
    safemeDom.setHtml('number', MobileNumber);
    safemeDom.setHtml('nic', Nic);
    safemeDom.setHtml('city', City);
    safemeDom.setHtml('email', Email);
    safemeDom.setHtml('district', District);
    safemeDom.setHtml('address', Address);
    safemeDom.setHtml('status-dropdown', Status);

    var locNameEl = document.getElementById('safeme-loc-user-name');
    if (locNameEl) {
        locNameEl.textContent = Name || 'Citizen';
    }

    applySafeMeMedia(d);

    if (d.Latitude != null) {
        localStorage.setItem('SafeMeLat', d.Latitude);
    }
    if (d.Longitude != null) {
        localStorage.setItem('SafeMeLong', d.Longitude);
    }
    if (d.Name) {
        localStorage.setItem('SafeMeName', d.Name);
    }
    if (d.Status) {
        localStorage.setItem('SafeMeStatus', d.Status);
    }
    if (d.Severity) {
        localStorage.setItem('SafeMeSeverity', d.Severity);
    }
    if (d.Date) {
        localStorage.setItem('SafeMeDate', d.Date);
    }
}

function populateSafeMeDetailFields() {
    applySafeMeFields({
        Name: Name,
        NIC: Nic,
        Mobile: MobileNumber,
        City: City,
        Status: Status,
        ProfileImage: ProfileImage,
        AudioMP3: Audio,
        Image1: Image1,
        Image2: Image2,
        Image3: Image3,
        Image4: Image4,
        Image5: Image5,
        District: District,
        Email: Email,
        Address: Address,
    });
}

/** Always reload from Firebase so image/audio URLs are not corrupted via localStorage. */
function loadSafeMeFromDatabase() {
    if (!ID || typeof firebase === 'undefined') {
        populateSafeMeDetailFields();
        return;
    }
    var ref = firebase.database().ref('SafeMe/All/' + ID);
    ref.once('value')
        .then(function (snap) {
            var d = snap.val();
            if (d) {
                applySafeMeFields(d);
            } else {
                populateSafeMeDetailFields();
            }
        })
        .catch(function (e) {
            console.error('SafeMe detail load failed:', e);
            populateSafeMeDetailFields();
        });

    // Keep images/status fresh if citizen upload finishes after admin opens the page.
    ref.on('value', function (snap) {
        var d = snap.val();
        if (d) {
            applySafeMeFields(d);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSafeMeFromDatabase);
} else {
    loadSafeMeFromDatabase();
}

/****************** Update Function *********************/

function update() {
    var filterEl = document.getElementById('filterList');
    if (!filterEl) {
        return;
    }
    var statVal = filterEl.value;
    if (!statVal || statVal === 'Select status' || statVal === 'status') {
        if (window.safemeUi) {
            safemeUi.toastWarn('Select a status', 'Please choose a SafeMe status before updating.');
        } else {
            Swal.fire({ icon: 'warning', text: 'Please select a status!' });
        }
        return;
    }

    var alertRef = firebase.database().ref('SafeMe/All/' + ID);
    alertRef
        .once('value')
        .then(function (snap) {
            var row = snap.val() || {};
            var oldStatus = row.Status || Status || 'Alert Sent';
            if (oldStatus === statVal) {
                if (window.safemeUi) {
                    return safemeUi.toastWarn('No change', 'Status is already "' + statVal + '".');
                }
                return Swal.fire({ icon: 'info', text: 'Status is already "' + statVal + '".' });
            }

            var patch = { Status: statVal };
            if (statVal === 'Closed' || statVal === 'Action Taken') {
                patch.LiveLocation = false;
            }

            return alertRef.update(patch).then(function () {
                return window.safemeCounters.applyStatusChange(oldStatus, statVal);
            }).then(function () {
                Status = statVal;
                localStorage.setItem('SafeMeStatus', statVal);
                safemeDom.setHtml('status-dropdown', Status);
                if (window.safemeUi) {
                    return safemeUi.toastSuccess(
                        'SafeMe updated',
                        'Status changed to "' + statVal + '". Counts updated.'
                    );
                }
                return Swal.fire({
                    icon: 'success',
                    title: 'Updated successfully',
                    text: 'Status changed to "' + statVal + '".',
                });
            });
        })
        .catch(function (e) {
            console.error(e);
            if (window.safemeUi) {
                safemeUi.toastError('Update failed', 'Could not update SafeMe status.');
            } else {
                Swal.fire({ icon: 'error', text: 'Could not update SafeMe status.' });
            }
        });
}

/**************************** Email sending function **********************************/
const form = document.querySelector('.contact-form');
var select = document.getElementById('safe-me-status');
if (select) {
    var status = select.options[select.selectedIndex].value;
}

safemeDom.setValue('email-name', Name);
safemeDom.setValue('safe-me-email', Email);
safemeDom.setValue('safe-me-ID', ID);
safemeDom.setValue('safe-me-comment', '');

if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.querySelector('.name').value;
        var email = document.querySelector('.email').value;
        var statusVal = document.querySelector('.status').value;
        var id = document.querySelector('.id').value;
        var comment = document.querySelector('.comment').value;

        if (statusVal == 'status') {
            Swal.fire({
                icon: 'warning',
                text: 'Please select the current status',
            });
            return;
        }
        if (comment == '') {
            Swal.fire({
                icon: 'warning',
                text: 'Please enter a comment',
            });
            return;
        }

        sendEmail(name, email, statusVal, id, comment);
    });
}

function sendEmail(name, email, status, id, comment) {
    Email.send({
        Host: 'smtp.elasticemail.com',
        Username: 'canukaanurudda@gmail.com',
        Password: 'D8C5B43F0DE9D4D1E9D48A29CA089CDC1A5B',
        To: `${email}`,
        From: 'canukaanurudda@gmail.com',
        Subject: `${name} Just updated your safe me inquire status`,
        Body: `Name: ${name} <br> Email: ${email} <br> Status: ${status} <br> SafeMeID: ${id} <br> Comments : ${comment}`,
    })
        .then(function () {
            Swal.fire({
                icon: 'success',
                text: 'Status Updated and message sent successfully.',
            }).then(function () {
                location.href = 'safeMe.html';
            });
        })
        .catch(function () {
            Swal.fire({
                icon: 'error',
                text: 'Failed sending message',
            }).then(function () {
                location.href = 'safeMe.html';
            });
        });
}

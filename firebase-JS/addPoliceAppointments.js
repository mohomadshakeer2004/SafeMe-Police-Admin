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

/**Getting the AID from DB and setting it in the text field*/
var AIDFromDB;
var countFromDB;

function setAIDFromDB() {
    firebase.database().ref('Appointments').on('value', function (snapshot) {
        var data = snapshot.val();
        if (!data) {
            return;
        }
        var nextAid = (parseInt(data.LastAIDP, 10) || 0) + 1;
        safemeDom.setText('last-aid', nextAid);
        AIDFromDB = nextAid;
        countFromDB = data.PoliceAppointmentCount;
    });
}

/**Adding a new appointment to database*/
var AID,Email,NIC,City,Telephone,Type,ScheduleDate;

function add(){
    AID = document.getElementById('last-aid').value;
    Email = document.getElementById('email').value;
    NIC = document.getElementById('nic').value;
    City = document.getElementById('city').value;
    Telephone = document.getElementById('telephone').value;
    Type = document.getElementById('type').value;
    ScheduleDate = document.getElementById('date').value;

    validateNAdd();


}


function validateNAdd(){
    var e = document.getElementById("type");
    var optionSelIndex = e.options[e.selectedIndex].value;
    if(AID == "" | Email == "" | NIC == "" | City == "" | Telephone == ""  | Type == "" | ScheduleDate == "" ){

        Swal.fire({
            icon: 'warning',
            text: 'Please fill out all the fields',
        })
        return;
    }
    else if (optionSelIndex == 0) {

        Swal.fire({
            icon: 'warning',
            text: 'Please select a type',
        })
        return;
    }
    else if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(Email)){

        if (/^\d{10}$/.test(Telephone)){
            firebase.database().ref('Appointments/PoliceAppointments/'+AIDFromDB).set({
                AIDP: AIDFromDB,
                City: City,
                Email: Email,
                Mobile: Telephone,
                NIC: NIC,
                ScheduledDate: ScheduleDate,
                Status: "Pending",
                Type: Type,

            });

            /**updating the last ID in DB */
            firebase.database().ref('Appointments').update({
                LastAIDP:AIDFromDB,
            });
            /**updating the police appointment count in DB */
            firebase.database().ref('Appointments').update({
                PoliceAppointmentCount:countFromDB+1,
            });


            Swal.fire({
                icon: 'success',
                text: 'Appointment Added!',
            }).then((result)=>{
                window.location.href = "policeAppointments.html";
            })
        }else {
            Swal.fire({
                icon: 'warning',
                text: 'You have entered an invalid telephone number!',
            })
            return;
        }
    }
    else{
        Swal.fire({
            icon: 'warning',
            text: 'You have entered an invalid email address!',
        })
        return;
    }
}
/**Blocking previous dates*/
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;
$('#date').attr('min',today);

/** telephone validation */
function limit(element)
{
    var max_chars = 10;

    if(element.value.length > max_chars) {
        element.value = element.value.substr(0, max_chars);
    }
}

/**Blocking previous dates*/
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;
$('#date').attr('min',today);
setAIDFromDB();

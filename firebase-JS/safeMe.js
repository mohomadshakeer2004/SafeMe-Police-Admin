//variables
var cardClass = document.getElementById('safeme_table');

//Filter
var filtervalue = safemeDom.filterValue();

/** Generate SafeMe function ******************************************************************* */
function safeMeFunction(SID, Name, NIC, Contact, City, Date, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address) {
    var htmlCard = `
<tr>
           <td>${SID}</td>
           <td><img src="${ProfileImage}" alt=""
           class="rounded-circle thumb-xs me-1"> ${Name}
           </td>
           <td>${NIC}</td>
           <td>${Contact}</td>
           <td>${City}</td>
           <td>${Date}</td>
           <td><span class="badge badge-outline-primary">${Severity}</span></td>
           <td><span class="badge badge-soft-warning">${Status}</span></td>
           <td class="text-end">
           <a href="safeMeFullDetails.html" onclick="viewMore('${SID}','${Name}','${NIC}','${Contact}','${City}','${Date}','${Severity}','${Status}','${ProfileImage}','${Audio}','${Image1}','${Image2}','${Image3}','${Image4}','${Image5}','${District}','${Lat}','${Long}','${Email}','${Address}')"><i class="las dripicons-document text-secondary font-18"></i></a>
           <span style="cursor: pointer"  onclick="deleteSafeMe('${SID}')"><i class="las la-trash-alt text-secondary font-22"></i></span>
           </td>
           </tr>
`
    return htmlCard
}

function showSafeMe(cards) {
    safemeDom.renderRows(cardClass, cards);
}

async function fetchAllSafeMeAwait() {
    var cards = []
    var task = await firebase.database().ref('SafeMe/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let SID = ChildSnapshot.val().SID;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let Contact = ChildSnapshot.val().Mobile;
                let City = ChildSnapshot.val().City;
                let Date = ChildSnapshot.val().Date;
                let Severity = ChildSnapshot.val().Severity;
                let Status = ChildSnapshot.val().Status;
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Audio = ChildSnapshot.val().AudioMP3;
                let Image1 = ChildSnapshot.val().Image1;
                let Image2 = ChildSnapshot.val().Image2;
                let Image3 = ChildSnapshot.val().Image3;
                let Image4 = ChildSnapshot.val().Image4;
                let Image5 = ChildSnapshot.val().Image5;
                let District = ChildSnapshot.val().District;
                let Long = ChildSnapshot.val().Longitude;
                let Lat = ChildSnapshot.val().Latitude;
                let Email = ChildSnapshot.val().Email;
                let Address = ChildSnapshot.val().Address;

                cards.push(safeMeFunction(SID, Name, NIC, Contact, City, Date, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address));
            }
        );
    });
    return cards
}

async function fetchAllSafeMe() {
    var data = await fetchAllSafeMeAwait()
    showSafeMe(data)
}

/**Search function**********************************************************************************/
safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

async function searchAwait(searchString) {
    var cards = []
    var task = await firebase.database().ref('SafeMe/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let SID = ChildSnapshot.val().SID;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let Contact = ChildSnapshot.val().Mobile;
                let City = ChildSnapshot.val().City;
                let Date = ChildSnapshot.val().Date;
                let Severity = ChildSnapshot.val().Severity;
                let Status = ChildSnapshot.val().Status;
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Audio = ChildSnapshot.val().AudioMP3;
                let Image1 = ChildSnapshot.val().Image1;
                let Image2 = ChildSnapshot.val().Image2;
                let Image3 = ChildSnapshot.val().Image3;
                let Image4 = ChildSnapshot.val().Image4;
                let Image5 = ChildSnapshot.val().Image5;
                let District = ChildSnapshot.val().District;
                let Long = ChildSnapshot.val().Longitude;
                let Lat = ChildSnapshot.val().Latitude;
                let Email = ChildSnapshot.val().Email;
                let Address = ChildSnapshot.val().Address;

                if (NIC.toLowerCase().includes(searchString) | Name.toLowerCase().includes(searchString) | City.toLowerCase().includes(searchString)) {
                    cards.push(safeMeFunction(SID, Name, NIC, Contact, City, Date, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address));
                }
            }
        );
    });
    return cards
}

async function search(searchString) {

    var data = await searchAwait(searchString);
    showSafeMe(data)
}


/*******************************Filter Function *************************************** */
function updateFilter() {
    filtervalue = safemeDom.filterValue();
}

async function filterAwait() {
    var cards4 = []

    var task = await firebase.database().ref('SafeMe/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let SID = ChildSnapshot.val().SID;
                let Name = ChildSnapshot.val().Name;
                let NIC = ChildSnapshot.val().NIC;
                let Contact = ChildSnapshot.val().Mobile;
                let City = ChildSnapshot.val().City;
                let Date = ChildSnapshot.val().Date;
                let Severity = ChildSnapshot.val().Severity;
                let Status = ChildSnapshot.val().Status;
                let ProfileImage = ChildSnapshot.val().ProfileImage;
                let Audio = ChildSnapshot.val().AudioMP3;
                let Image1 = ChildSnapshot.val().Image1;
                let Image2 = ChildSnapshot.val().Image2;
                let Image3 = ChildSnapshot.val().Image3;
                let Image4 = ChildSnapshot.val().Image4;
                let Image5 = ChildSnapshot.val().Image5;
                let District = ChildSnapshot.val().District;
                let Long = ChildSnapshot.val().Longitude;
                let Lat = ChildSnapshot.val().Latitude;
                let Email = ChildSnapshot.val().Email;
                let Address = ChildSnapshot.val().Address;

                if (Status.includes(filtervalue)) {
                    cards4.push(safeMeFunction(SID, Name, NIC, Contact, City, Date, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address));
                } else if (filtervalue === "All") {
                    cards4.push(safeMeFunction(SID, Name, NIC, Contact, City, Date, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address));
                }

            }
        );
    });
    return cards4
}

async function filter() {

    var data4 = await filterAwait();
    showSafeMe(data4);
}

/*******************************Delete SafeMe *************************************** */
function deleteSafeMe(SID) {

    Swal.fire({
        title: 'Are you sure you want to delete this safeMe alert from database?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Delete Complaint!
                var db = firebase.database();
                var ref = db.ref();
                var survey = db.ref("SafeMe/All");
                survey.child(SID).remove();
                location.reload();
        }
    })
}


/*******************************Pass values to Safme Full Detail Page*************************************** */
function viewMore(SID, Name, NIC, Contact, City, Date, Severity, Status, ProfileImage,Audio,Image1,Image2,Image3,Image4,Image5,District,Lat,Long,Email,Address) {
    localStorage.setItem("SafeMeID",SID);
    localStorage.setItem("SafeMeName",Name);
    localStorage.setItem("SafeMeNIC",NIC);
    localStorage.setItem("SafeMeContact",Contact);
    localStorage.setItem("SafeMeCity",City);
    localStorage.setItem("SafeMeDate",Date);
    localStorage.setItem("SafeMeSeverity",Severity);
    localStorage.setItem("SafeMeStatus",Status);
    localStorage.setItem("SafeMeProfileImage",ProfileImage);
    localStorage.setItem("SafeMeAudio",Audio);
    localStorage.setItem("SafeMeImage1",Image1);
    localStorage.setItem("SafeMeImage2",Image2);
    localStorage.setItem("SafeMeImage3",Image3);
    localStorage.setItem("SafeMeImage4",Image4);
    localStorage.setItem("SafeMeImage5",Image5);
    localStorage.setItem("SafeMeDistrict",District);
    localStorage.setItem("SafeMeLat",Lat);
    localStorage.setItem("SafeMeLong",Long);
    localStorage.setItem("SafeMeEmail",Email);
    localStorage.setItem("SafeMeAddress",Address);
}

if (cardClass) {
    fetchAllSafeMe();
}
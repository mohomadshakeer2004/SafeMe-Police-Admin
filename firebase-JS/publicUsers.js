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

//variables
var cardClass = document.getElementById('public-users');


/**Generate Users function******************************************************************** */
function generateUsers(UserPic,Name, Email, NIC, Mobile,City, District, Address) {
    var htmlCard = `
          <div class="col-lg-4">
                            <div class="text-center card-box">
                                <div class="member-card pt-2 pb-2">
                                    <div class="thumb-lg member-thumb mx-auto"><img src=${UserPic} class="rounded-circle img-thumbnail" alt="profile-image"></div>
                                   <br>
                                    <div class="">
                                        <h4>${Name}</h4>
                                        <p class="text-muted mb-0">${Email}</p>
                                         <p class="text-muted">${NIC}</p>
                                    </div>

                                    <div class="mt-4">
                                        <div class="row">     
                                            <div class="col-4">
                                                <div class="mt-3">
                                                    <h5>Number</h5>
                                                    <p class="mb-0 text-muted">${Mobile}</p>
                                                </div>
                                            </div>

                                            <div class="col-4">
                                                <div class="mt-3">
                                                    <h5 >City</h5>
                                                    <p class="mb-0 text-muted">${City}</p>
                                                </div>
                                            </div>

                                            <div class="col-4">
                                                <div class="mt-3">
                                                    <h5>District</h5>
                                                    <p class="mb-0 text-muted">${District}</p>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="mt-3">
                                                    <h5 >Address</h5>
                                                    <p class="mb-0 text-muted">${Address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
           `
    return htmlCard
}

function showUsers(cards) {
    safemeDom.renderRows(cardClass, cards);
}

async function fetchAllUsersAwait() {
    var cards = []

    var task = await firebase.database().ref('PublicUsers/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let UserPic = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let Email = ChildSnapshot.val().Email;
                let NIC = ChildSnapshot.val().NIC;
                let Mobile = ChildSnapshot.val().Mobile;
                let City = ChildSnapshot.val().City;
                let District = ChildSnapshot.val().District;
                let Address = ChildSnapshot.val().Address;

                cards.push(generateUsers(UserPic,Name, Email, NIC, Mobile,City, District, Address));
            }
        );
    });
    return cards
}

async function fetchAllUsers() {
    var data = await fetchAllUsersAwait()
    showUsers(data)
}

/**Search function**********************************************************************************/
safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

async function searchAwait(searchString) {
    var cards = []
    var task = await firebase.database().ref('PublicUsers/All').once('value', function (snapshot) {
        snapshot.forEach(
            function (ChildSnapshot) {
                let UserPic = ChildSnapshot.val().ProfileImage;
                let Name = ChildSnapshot.val().Name;
                let Email = ChildSnapshot.val().Email;
                let NIC = ChildSnapshot.val().NIC;
                let Mobile = ChildSnapshot.val().Mobile;
                let City = ChildSnapshot.val().City;
                let District = ChildSnapshot.val().District;
                let Address = ChildSnapshot.val().Address;

                if (NIC.toLowerCase().includes(searchString) | Name.toLowerCase().includes(searchString) | City.toLowerCase().includes(searchString)) {
                    cards.push(generateUsers(UserPic,Name, Email, NIC, Mobile,City, District, Address));
                }
            }
        );
    });
    return cards
}

async function search(searchString) {

    var data = await searchAwait(searchString);
    showUsers(data)
}
if (cardClass) {
    fetchAllUsers();
}
/** Lost & Found list — Type "Lost And Found" from Complaints/All (matches citizen app). */
(function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            if (cardClass) {
                fetchAllLostAndFound().catch(function (e) {
                    console.error('fetchAllLostAndFound failed:', e);
                });
            }
        } else {
            window.location.replace('index.html');
        }
    });
})();

var cardClass = document.getElementById('complaint_table');
var filtervalue = safemeDom.filterValue();

function generateComplaints(
    ProfileImage,
    Name,
    NIC,
    ContactNo,
    CID,
    City,
    Status,
    Address,
    Date,
    Description,
    District,
    Email,
    Image1,
    Image2,
    Longitude,
    Latitude,
    Reason,
    Type
) {
    var safeNic = (NIC || '').replace(/'/g, "\\'");
    var img =
        ProfileImage && String(ProfileImage).trim()
            ? ProfileImage
            : 'assets/images/users/user-1.jpg';
    var evidenceRaw = Image1 != null ? String(Image1).trim() : '';
    var hasEvidence =
        evidenceRaw.indexOf('http://') === 0 ||
        evidenceRaw.indexOf('https://') === 0 ||
        evidenceRaw.indexOf('data:image') === 0;
    var evidenceHtml = hasEvidence
        ? '<img src="' +
          evidenceRaw.replace(/"/g, '&quot;') +
          '" alt="evidence" class="rounded thumb-sm safeme-lf-thumb" referrerpolicy="no-referrer" style="width:48px;height:48px;object-fit:cover">'
        : '<span class="text-muted small">No photo</span>';
    return `
          <tr>
                <td><img src="${img}" alt="" class="rounded-circle thumb-xs me-1">${Name || ''}</td>
                <td>${NIC || ''}</td>
                <td>${ContactNo || ''}</td>
                <td>${CID || ''}</td>
                <td>${City || ''}</td>
                <td>${evidenceHtml}</td>
                <td><span class="badge badge-soft-primary">${Status || ''}</span></td>
                <td class="text-end">
                     <a href="editAndViewComplaints.html" onclick="viewMore('${CID}','${Date}','${Longitude}','${Latitude}','${Type}','${safeNic}')">
                       <button class="btn btn-primary btn-view" type="button">View</button></a>
                     <a href="#" onclick="deleteComplaints('${CID}','${safeNic}')"><i class="las la-trash-alt text-secondary icon "></i></a>
                </td>
          </tr>
           `;
}

function rowToCard(row) {
    return generateComplaints(
        row.ProfileImage,
        row.Name,
        row.NIC,
        row.Mobile,
        row.CID,
        row.City,
        row.Status,
        row.Address,
        row.Date,
        row.Description,
        row.District,
        row.Email,
        row.Image1,
        row.Image2,
        row.Longitude,
        row.Latitude,
        row.Reason,
        row.Type
    );
}

function showComplaints(cards) {
    safemeDom.renderRows(cardClass, cards);
}

async function fetchAllLostAndFoundAwait() {
    var rows = await SafeMeComplaints.fetchAllLostAndFoundMerged();
    return rows.map(rowToCard);
}

async function fetchAllLostAndFound() {
    var data = await fetchAllLostAndFoundAwait();
    showComplaints(data);
}

function deleteComplaints(CID, NIC) {
    Swal.fire({
        title: 'Delete this Lost & Found record?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await SafeMeComplaints.deleteComplaintEverywhere(CID);
                location.reload();
            } catch (e) {
                console.error(e);
                Swal.fire({ icon: 'error', text: 'Delete failed.' });
            }
        }
    });
}

safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

async function searchAwait(searchString) {
    var q = (searchString || '').toLowerCase();
    var rows = await SafeMeComplaints.fetchAllLostAndFoundMerged();
    return rows
        .filter(function (row) {
            var name = (row.Name || '').toLowerCase();
            var nic = (row.NIC || '').toLowerCase();
            var city = (row.City || '').toLowerCase();
            return name.includes(q) || nic.includes(q) || city.includes(q);
        })
        .map(rowToCard);
}

async function search(searchString) {
    var data = await searchAwait(searchString);
    showComplaints(data);
}

function updateFilter() {
    filtervalue = safemeDom.filterValue();
}

async function filterAwait() {
    var rows = await SafeMeComplaints.fetchAllLostAndFoundMerged();
    return rows
        .filter(function (row) {
            var status = row.Status || '';
            if (filtervalue === 'All') {
                return true;
            }
            return status.includes(filtervalue);
        })
        .map(rowToCard);
}

async function filter() {
    var data4 = await filterAwait();
    showComplaints(data4);
}

function viewMore(CID, Date, Longitude, Latitude, Type, NIC) {
    localStorage.setItem('ComplaintCID', CID);
    localStorage.setItem('ComplaintNIC', NIC || '');
    localStorage.setItem('ComplaintDate', Date);
    localStorage.setItem('ComplaintLongitude', Longitude);
    localStorage.setItem('ComplaintLatitude', Latitude);
    localStorage.setItem('ComplaintType', Type);
}

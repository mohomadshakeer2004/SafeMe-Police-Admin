//variables
var cardClass = document.getElementById('safeme_table');

//Filter
var filtervalue = safemeDom.filterValue();

function escapeHtml(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatCoords(lat, lng, row) {
    var la = parseFloat(lat);
    var lo = parseFloat(lng);
    if (isNaN(la) || isNaN(lo) || (la === 0 && lo === 0)) {
        return '<span class="text-muted">No location</span>';
    }
    var mapsUrl =
        'https://www.google.com/maps?q=' +
        encodeURIComponent(la + ',' + lo);
    var person = escapeHtml((row && row.Name) || 'Citizen');
    var isShake =
        row &&
        (String(row.Source || '').toLowerCase().indexOf('shake') !== -1 ||
            row.LiveLocation === true ||
            row.LiveLocation === 'true');
    var updatedAt = (row && row.LocationUpdatedAt) || '';
    var updatedShort = updatedAt
        ? String(updatedAt).replace('T', ' ').substring(11, 19)
        : '';
    var label = isShake
        ? '<div class="small text-danger fw-semibold" title="' +
          person +
          ' — current &amp; live location (phone shake)">Live · ' +
          person +
          '</div>'
        : '<div class="small text-muted" title="' +
          person +
          ' — reported location">' +
          person +
          '</div>';
    return (
        '<div class="safeme-loc-cell">' +
        label +
        '<div class="small fw-semibold">' +
        la.toFixed(4) +
        ', ' +
        lo.toFixed(4) +
        '</div>' +
        (updatedShort
            ? '<div class="small text-success">' + escapeHtml(updatedShort) + '</div>'
            : '') +
        '<a class="small" href="' +
        mapsUrl +
        '" target="_blank" rel="noopener">Map</a>' +
        '</div>'
    );
}

function liveBadge(row) {
    var person = (row && row.Name) || 'Citizen';
    if (row && (row.LiveLocation === true || row.LiveLocation === 'true')) {
        return (
            '<span class="badge badge-soft-danger ms-1" title="' +
            escapeHtml(person) +
            ' shook phone — GPS updates live">LIVE GPS</span>'
        );
    }
    if (row && String(row.Source || '').toLowerCase().indexOf('shake') !== -1) {
        return (
            '<span class="badge badge-soft-warning ms-1" title="Shake alert from ' +
            escapeHtml(person) +
            '">Shake alert</span>'
        );
    }
    return '';
}

/** Generate SafeMe function ******************************************************************* */
function safeMeFunction(row) {
    var SID = row.SID;
    var Name = row.Name || '';
    var NIC = row.NIC || '';
    var Contact = row.Mobile || '';
    var City = row.City || '';
    var Date = row.Date || '';
    var Severity = row.Severity || '';
    var Status = row.Status || '';
    var ProfileImage = row.ProfileImage || 'assets/images/users/user-1.jpg';
    var Audio = row.AudioMP3 || '';
    var Image1 = row.Image1 || '';
    var Image2 = row.Image2 || '';
    var Image3 = row.Image3 || '';
    var Image4 = row.Image4 || '';
    var Image5 = row.Image5 || '';
    var District = row.District || '';
    var Lat = row.Latitude;
    var Long = row.Longitude;
    var Email = row.Email || '';
    var Address = row.Address || '';
    var source = row.Source
        ? '<div class="small text-muted text-truncate" title="' +
          escapeHtml(row.Source) +
          '">' +
          escapeHtml(row.Source) +
          '</div>'
        : '';

    return `
<tr>
           <td>${SID}${liveBadge(row)}${source}</td>
           <td><img src="${ProfileImage}" alt=""
           class="rounded-circle thumb-xs me-1"> <span class="text-truncate d-inline-block" style="max-width:9rem;vertical-align:middle">${escapeHtml(Name)}</span>
           </td>
           <td class="text-truncate">${escapeHtml(NIC)}</td>
           <td class="text-truncate">${escapeHtml(String(Contact))}</td>
           <td class="text-truncate">${escapeHtml(City)}</td>
           <td>${formatCoords(Lat, Long, row)}</td>
           <td class="small text-truncate" title="${escapeHtml(Date)}">${escapeHtml(String(Date).substring(0, 16))}</td>
           <td><span class="badge badge-outline-primary">${escapeHtml(Severity)}</span></td>
           <td><span class="badge badge-soft-warning">${escapeHtml(Status)}</span></td>
           <td class="text-end text-nowrap">
           <a href="safeMeFullDetails.html" onclick="viewMore('${SID}')"><i class="las dripicons-document text-secondary font-18"></i></a>
           <span style="cursor: pointer"  onclick="deleteSafeMe('${SID}')"><i class="las la-trash-alt text-secondary font-22"></i></span>
           </td>
           </tr>
`;
}

var liveSafeMeRows = [];
var liveSafeMeUnsub = null;
var searchQuery = '';

function setLiveStatus(ok, message) {
    var el = document.getElementById('safeme-live-status');
    if (!el) {
        return;
    }
    el.textContent = message || (ok ? 'Live' : 'Offline');
    el.className =
        'badge ms-2 ' + (ok ? 'badge-soft-success' : 'badge-soft-danger');
}

function normalizeSafeMeRow(row, key) {
    if (!row || typeof row !== 'object') {
        return null;
    }
    if (row.SID == null && key != null) {
        row.SID = isNaN(Number(key)) ? key : Number(key);
    }
    if (row.SID == null) {
        return null;
    }
    return row;
}

function snapshotToRows(snapshot) {
    var rows = [];
    if (!snapshot || !snapshot.forEach) {
        return rows;
    }
    snapshot.forEach(function (ChildSnapshot) {
        var row = normalizeSafeMeRow(ChildSnapshot.val(), ChildSnapshot.key);
        if (row) {
            rows.push(row);
        }
    });
    rows.sort(function (a, b) {
        return Number(b.SID) - Number(a.SID);
    });
    return rows;
}

function rowMatchesFilters(row) {
    if (!row) {
        return false;
    }
    var status = row.Status || '';
    if (filtervalue && filtervalue !== 'All' && status.indexOf(filtervalue) === -1) {
        return false;
    }
    if (!searchQuery) {
        return true;
    }
    var name = String(row.Name || '').toLowerCase();
    var nic = String(row.NIC || '').toLowerCase();
    var city = String(row.City || '').toLowerCase();
    return (
        name.indexOf(searchQuery) !== -1 ||
        nic.indexOf(searchQuery) !== -1 ||
        city.indexOf(searchQuery) !== -1
    );
}

function renderLiveSafeMeList() {
    if (!cardClass) {
        return;
    }
    var cards = [];
    for (var i = 0; i < liveSafeMeRows.length; i++) {
        if (rowMatchesFilters(liveSafeMeRows[i])) {
            cards.push(safeMeFunction(liveSafeMeRows[i]));
        }
    }
    safemeDom.renderRows(cardClass, cards);
}

function showSafeMe(cards) {
    safemeDom.renderRows(cardClass, cards);
}

function snapshotToCards(snapshot) {
    return snapshotToRows(snapshot).map(safeMeFunction);
}

function applyLiveSnapshot(snapshot) {
    liveSafeMeRows = snapshotToRows(snapshot);
    renderLiveSafeMeList();
    setLiveStatus(true, 'Live · ' + liveSafeMeRows.length + ' alerts');
}

var liveRenderTimer = null;
function applyLiveSnapshotDebounced(snapshot) {
    // Keep latest snapshot; coalesce rapid GPS pulses into one redraw.
    liveSafeMeRows = snapshotToRows(snapshot);
    if (liveRenderTimer) {
        clearTimeout(liveRenderTimer);
    }
    liveRenderTimer = setTimeout(function () {
        renderLiveSafeMeList();
        setLiveStatus(true, 'Live · ' + liveSafeMeRows.length + ' alerts');
    }, 120);
}

function bindLiveSafeMeList() {
    if (!cardClass || typeof firebase === 'undefined') {
        setLiveStatus(false, 'Table missing');
        return;
    }
    if (liveSafeMeUnsub) {
        try {
            liveSafeMeUnsub();
        } catch (e) {}
        liveSafeMeUnsub = null;
    }

    var ref = firebase.database().ref('SafeMe/All');
    var handler = function (snapshot) {
        applyLiveSnapshotDebounced(snapshot);
    };
    var errHandler = function (err) {
        console.error('SafeMe live list failed:', err);
        setLiveStatus(false, 'Live sync failed');
    };
    ref.on('value', handler, errHandler);
    liveSafeMeUnsub = function () {
        ref.off('value', handler);
    };
    setLiveStatus(true, 'Connecting…');

    // Immediate one-shot in case .on is delayed by rules/auth.
    ref.once('value')
        .then(function (snapshot) {
            applyLiveSnapshot(snapshot);
        })
        .catch(function (err) {
            console.error('SafeMe once() failed:', err);
            setLiveStatus(false, 'Read failed — check login');
        });
}

/** Auth first — RTDB rules need a signed-in admin before .on() works reliably */
(function () {
    function startWhenReady() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            setLiveStatus(false, 'Firebase missing');
            return;
        }
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                bindLiveSafeMeList();
            } else {
                if (liveSafeMeUnsub) {
                    try {
                        liveSafeMeUnsub();
                    } catch (e) {}
                    liveSafeMeUnsub = null;
                }
                setLiveStatus(false, 'Signed out');
            }
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startWhenReady);
    } else {
        startWhenReady();
    }
})();

/**Search function********************************************************************************** */
safemeDom.bindSearch(function (searchString) {
    searchQuery = searchString || '';
    renderLiveSafeMeList();
});

function search(searchString) {
    searchQuery = (searchString || '').toLowerCase();
    renderLiveSafeMeList();
}

/*******************************Filter Function *************************************** */
function updateFilter() {
    filtervalue = safemeDom.filterValue();
}

function filter() {
    filtervalue = safemeDom.filterValue();
    renderLiveSafeMeList();
}

/*******************************Delete SafeMe *************************************** */
function deleteSafeMe(SID) {
    Swal.fire({
        title: 'Are you sure you want to delete this SafeMe from database?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0c213a',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, delete it!',
    }).then(function (result) {
        if (!result.isConfirmed) {
            return;
        }
        var alertRef = firebase.database().ref('SafeMe/All/' + SID);
        alertRef
            .once('value')
            .then(function (snap) {
                var row = snap.val() || {};
                var status = row.Status || 'Alert Sent';
                return alertRef.remove().then(function () {
                    return window.safemeCounters.applyDelete(status);
                });
            })
            .then(function () {
                return Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    text: 'SafeMe alert removed and counts updated.',
                    timer: 1400,
                    showConfirmButton: false,
                });
            })
            .catch(function (e) {
                console.error(e);
                Swal.fire({ icon: 'error', text: 'Could not delete SafeMe alert.' });
            });
    });
}

function viewMore(SID) {
    // Only store SID — image/audio URLs break if passed through HTML onclick / localStorage.
    localStorage.setItem('SafeMeID', SID);
}

if (cardClass && !firebase.apps.length) {
    /* auth handled elsewhere */
}

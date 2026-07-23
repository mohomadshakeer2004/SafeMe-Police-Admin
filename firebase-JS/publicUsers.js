/** Public Users — professional citizen directory cards */
(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            window.location.replace('index.html');
        }
    });
})();

var cardClass = document.getElementById('public-users');
var allUserRows = [];

function escapeHtml(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function resolveProfileUrl(url) {
    if (window.safemeMedia && typeof safemeMedia.isUsableUrl === 'function') {
        return safemeMedia.isUsableUrl(url) ? String(url).trim() : '';
    }
    var s = url == null ? '' : String(url).trim();
    if (
        !s ||
        s === 'null' ||
        s === 'undefined' ||
        s === 'None' ||
        s === 'assets/images/no-profile.png'
    ) {
        return '';
    }
    if (
        s.indexOf('http://') === 0 ||
        s.indexOf('https://') === 0 ||
        s.indexOf('data:image') === 0 ||
        s.indexOf('blob:') === 0
    ) {
        return s;
    }
    return '';
}

function initialsFromName(name) {
    var parts = String(name || 'U')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) {
        return 'U';
    }
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function generateUsers(row) {
    var name = row.Name || 'Citizen';
    var email = row.Email || '—';
    var nic = row.NIC || '—';
    var mobile = row.Mobile != null ? String(row.Mobile) : '—';
    var city = row.City || '—';
    var district = row.District || '—';
    var address = row.Address || '—';
    var photo = resolveProfileUrl(row.ProfileImage);
    var initials = initialsFromName(name);
    var photoHtml = photo
        ? '<img src="' +
          escapeHtml(photo) +
          '" alt="' +
          escapeHtml(name) +
          '" class="pu-avatar-img" referrerpolicy="no-referrer" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<span class="pu-avatar-fallback" style="display:none">' +
          escapeHtml(initials) +
          '</span>'
        : '<span class="pu-avatar-fallback">' + escapeHtml(initials) + '</span>';

    return (
        '<div class="col-xl-4 col-lg-6 col-md-6">' +
        '<article class="pu-card">' +
        '<div class="pu-card-accent"></div>' +
        '<div class="pu-card-body">' +
        '<div class="pu-avatar-wrap">' +
        photoHtml +
        '</div>' +
        '<h3 class="pu-name">' +
        escapeHtml(name) +
        '</h3>' +
        '<p class="pu-email">' +
        escapeHtml(email) +
        '</p>' +
        '<span class="pu-nic-badge">NIC ' +
        escapeHtml(nic) +
        '</span>' +
        '<div class="pu-meta-grid">' +
        '<div class="pu-meta-item">' +
        '<span class="pu-meta-label">Mobile</span>' +
        '<span class="pu-meta-value">' +
        escapeHtml(mobile) +
        '</span>' +
        '</div>' +
        '<div class="pu-meta-item">' +
        '<span class="pu-meta-label">City</span>' +
        '<span class="pu-meta-value">' +
        escapeHtml(city) +
        '</span>' +
        '</div>' +
        '<div class="pu-meta-item">' +
        '<span class="pu-meta-label">District</span>' +
        '<span class="pu-meta-value">' +
        escapeHtml(district) +
        '</span>' +
        '</div>' +
        '<div class="pu-meta-item pu-meta-full">' +
        '<span class="pu-meta-label">Address</span>' +
        '<span class="pu-meta-value">' +
        escapeHtml(address) +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</article>' +
        '</div>'
    );
}

function setUsersStatus(count) {
    var el = document.getElementById('pu-count');
    if (el) {
        el.textContent = count + (count === 1 ? ' registered citizen' : ' registered citizens');
    }
}

function showUsers(rows) {
    if (!cardClass) {
        return;
    }
    if (!rows.length) {
        cardClass.innerHTML =
            '<div class="col-12"><div class="pu-empty">No public users found.</div></div>';
        setUsersStatus(0);
        return;
    }
    var html = '';
    for (var i = 0; i < rows.length; i++) {
        html += generateUsers(rows[i]);
    }
    cardClass.innerHTML = html;
    setUsersStatus(rows.length);
}

function snapshotToRows(snapshot) {
    var rows = [];
    snapshot.forEach(function (child) {
        var row = child.val();
        if (!row || typeof row !== 'object') {
            return;
        }
        // Skip non-user meta nodes if any
        if (row.Name == null && row.NIC == null && row.Email == null) {
            return;
        }
        if (!row.NIC && child.key) {
            row.NIC = child.key;
        }
        rows.push(row);
    });
    rows.sort(function (a, b) {
        return String(a.Name || '').localeCompare(String(b.Name || ''));
    });
    return rows;
}

async function fetchAllUsers() {
    var snap = await firebase.database().ref('PublicUsers/All').once('value');
    allUserRows = snapshotToRows(snap);
    showUsers(allUserRows);
}

function search(searchString) {
    var q = (searchString || '').toLowerCase().trim();
    if (!q) {
        showUsers(allUserRows);
        return;
    }
    var filtered = allUserRows.filter(function (row) {
        var name = String(row.Name || '').toLowerCase();
        var nic = String(row.NIC || '').toLowerCase();
        var city = String(row.City || '').toLowerCase();
        var email = String(row.Email || '').toLowerCase();
        var mobile = String(row.Mobile || '').toLowerCase();
        return (
            name.indexOf(q) !== -1 ||
            nic.indexOf(q) !== -1 ||
            city.indexOf(q) !== -1 ||
            email.indexOf(q) !== -1 ||
            mobile.indexOf(q) !== -1
        );
    });
    showUsers(filtered);
}

safemeDom.bindSearch(function (searchString) {
    search(searchString);
});

if (cardClass) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            fetchAllUsers().catch(function (e) {
                console.error('fetchAllUsers failed:', e);
                cardClass.innerHTML =
                    '<div class="col-12"><div class="pu-empty">Could not load users.</div></div>';
            });
        }
    });
}

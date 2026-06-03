/** Requires firebase-config.js (and optional firebase-config.local.js) loaded first. */
var firebaseConfig = window.SAFEME_FIREBASE_CONFIG;

if (!firebaseConfig) {
    throw new Error("SAFEME_FIREBASE_CONFIG missing — load firebase-config.js before firebase.js");
}

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

/** Safe DOM helpers — avoids null errors in browser console */
(function (w) {
    w.safemeDom = {
        get: function (id) {
            return document.getElementById(id);
        },
        setText: function (id, value) {
            var el = document.getElementById(id);
            if (el && value !== undefined && value !== null) {
                el.innerText = value;
            }
        },
        setHtml: function (id, value) {
            var el = document.getElementById(id);
            if (el) {
                el.innerHTML = value != null ? value : '';
            }
        },
        setValue: function (id, value) {
            var el = document.getElementById(id);
            if (el && value !== undefined && value !== null) {
                el.value = value;
            }
        },
        setSrc: function (id, url) {
            var el = document.getElementById(id);
            if (el && url) {
                el.setAttribute('src', url);
            }
        },
        filterValue: function () {
            var el = document.getElementById('filterList');
            return el ? el.value : 'All';
        },
        bindSearch: function (handler) {
            var bar = document.getElementById('searchBar');
            if (bar && typeof handler === 'function') {
                bar.addEventListener('keyup', function (e) {
                    handler(e.target.value.toLowerCase());
                });
            }
        },
        renderRows: function (tableEl, cards) {
            if (!tableEl || !cards) {
                return;
            }
            tableEl.innerHTML = '';
            for (var i = 0; i < cards.length; i++) {
                tableEl.innerHTML += cards[i];
            }
        }
    };
})(window);

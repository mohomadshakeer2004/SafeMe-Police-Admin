/** Requires firebase-config.js (and optional firebase-config.local.js) loaded first. */
var firebaseConfig = window.SAFEME_FIREBASE_CONFIG;

if (!firebaseConfig) {
    throw new Error("SAFEME_FIREBASE_CONFIG missing — load firebase-config.js before firebase.js");
}

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

/**
 * SafeMe dashboard counters (PendingCount / CompletedCount / TotalCount).
 * New citizen alerts increment Pending + Total. Admin close/delete must reverse them.
 */
(function (w) {
    function normStatus(status) {
        return String(status || '').trim();
    }

    /** Still needs police attention (matches what mobile increments on create). */
    function isPendingStatus(status) {
        var s = normStatus(status);
        return s === 'Alert Sent' || s === 'Delete Requested';
    }

    function isCompletedStatus(status) {
        return normStatus(status) === 'Closed';
    }

    function readCounters() {
        return firebase
            .database()
            .ref('SafeMe')
            .once('value')
            .then(function (snap) {
                var d = snap.val() || {};
                return {
                    PendingCount: Number(d.PendingCount) || 0,
                    CompletedCount: Number(d.CompletedCount) || 0,
                    TotalCount: Number(d.TotalCount) || 0,
                };
            });
    }

    function writeCounters(next) {
        return firebase.database().ref('SafeMe').update({
            PendingCount: Math.max(0, next.PendingCount),
            CompletedCount: Math.max(0, next.CompletedCount),
            TotalCount: Math.max(0, next.TotalCount),
        });
    }

    /**
     * Adjust counters when an alert status changes (e.g. Alert Sent → Closed).
     */
    function applyStatusChange(oldStatus, newStatus) {
        var oldP = isPendingStatus(oldStatus);
        var newP = isPendingStatus(newStatus);
        var oldC = isCompletedStatus(oldStatus);
        var newC = isCompletedStatus(newStatus);
        var pendingDelta = (newP ? 1 : 0) - (oldP ? 1 : 0);
        var completedDelta = (newC ? 1 : 0) - (oldC ? 1 : 0);
        if (!pendingDelta && !completedDelta) {
            return Promise.resolve();
        }
        return readCounters().then(function (c) {
            return writeCounters({
                PendingCount: c.PendingCount + pendingDelta,
                CompletedCount: c.CompletedCount + completedDelta,
                TotalCount: c.TotalCount,
            });
        });
    }

    /**
     * Adjust counters when an alert is deleted.
     */
    function applyDelete(status) {
        var pendingDelta = isPendingStatus(status) ? -1 : 0;
        var completedDelta = isCompletedStatus(status) ? -1 : 0;
        return readCounters().then(function (c) {
            return writeCounters({
                PendingCount: c.PendingCount + pendingDelta,
                CompletedCount: c.CompletedCount + completedDelta,
                TotalCount: c.TotalCount - 1,
            });
        });
    }

    /**
     * Rebuild counters from all alerts (fixes drifted dashboard numbers).
     */
    function recountFromAll() {
        return firebase
            .database()
            .ref('SafeMe/All')
            .once('value')
            .then(function (snap) {
                var pending = 0;
                var completed = 0;
                var total = 0;
                snap.forEach(function (child) {
                    var row = child.val();
                    if (!row) {
                        return;
                    }
                    total += 1;
                    if (isPendingStatus(row.Status)) {
                        pending += 1;
                    }
                    if (isCompletedStatus(row.Status)) {
                        completed += 1;
                    }
                });
                return writeCounters({
                    PendingCount: pending,
                    CompletedCount: completed,
                    TotalCount: total,
                }).then(function () {
                    return { PendingCount: pending, CompletedCount: completed, TotalCount: total };
                });
            });
    }

    w.safemeCounters = {
        isPendingStatus: isPendingStatus,
        isCompletedStatus: isCompletedStatus,
        applyStatusChange: applyStatusChange,
        applyDelete: applyDelete,
        recountFromAll: recountFromAll,
    };
})(window);

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
            if (!tableEl) {
                return;
            }
            // Replace tbody in one write so the admin table always repaints.
            var html = '';
            if (cards && cards.length) {
                for (var i = 0; i < cards.length; i++) {
                    html += cards[i];
                }
            } else {
                html =
                    '<tr><td colspan="10" class="text-center text-muted py-4">No SafeMe alerts</td></tr>';
            }
            tableEl.innerHTML = html;
        }
    };
})(window);

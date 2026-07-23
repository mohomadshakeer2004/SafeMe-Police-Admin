/**
 * Complaints — legacy path only: Complaints/All/{CID}
 */
(function (w) {
    var ALL_TIMEOUT_MS = 20000;

    function isComplaintRow(val) {
        return val && typeof val === 'object' && (val.CID != null || val.Type);
    }

    function addComplaint(map, row, options) {
        options = options || {};
        if (!isComplaintRow(row)) {
            return;
        }
        var isLost = row.Type === 'Lost And Found';
        if (options.lostAndFoundOnly) {
            if (!isLost) {
                return;
            }
        } else if (isLost) {
            return;
        }
        var key = String(row.CID != null ? row.CID : '');
        if (!key) {
            return;
        }
        if (!map[key]) {
            map[key] = row;
        }
    }

    function collectFromValue(map, value, options) {
        if (value == null) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(function (item) {
                addComplaint(map, item, options);
            });
            return;
        }
        if (typeof value === 'object') {
            Object.keys(value).forEach(function (key) {
                var v = value[key];
                if (isComplaintRow(v)) {
                    addComplaint(map, v, options);
                } else if (
                    v &&
                    typeof v === 'object' &&
                    key !== 'lastCID' &&
                    key !== 'ComplaintCount' &&
                    key !== 'LostAndFoundCount' &&
                    key !== 'LastCID'
                ) {
                    collectFromValue(map, v, options);
                }
            });
        }
    }

    function onceWithTimeout(ref, ms) {
        return Promise.race([
            ref.once('value'),
            new Promise(function (_, reject) {
                setTimeout(function () {
                    reject(new Error('timeout after ' + ms + 'ms'));
                }, ms);
            }),
        ]);
    }

    async function fetchAllComplaintsMerged() {
        var map = {};
        var db = firebase.database();

        try {
            var allSnap = await onceWithTimeout(
                db.ref('Complaints/All'),
                ALL_TIMEOUT_MS
            );
            collectFromValue(map, allSnap.val());
            console.log('SafeMeComplaints: All →', Object.keys(map).length);
        } catch (e) {
            console.warn('Complaints/All:', e);
        }

        return Object.keys(map)
            .map(function (k) {
                return map[k];
            })
            .sort(function (a, b) {
                return (parseInt(b.CID, 10) || 0) - (parseInt(a.CID, 10) || 0);
            });
    }

    async function fetchAllLostAndFoundMerged() {
        var map = {};
        var db = firebase.database();

        try {
            var allSnap = await onceWithTimeout(
                db.ref('Complaints/All'),
                ALL_TIMEOUT_MS
            );
            collectFromValue(map, allSnap.val(), { lostAndFoundOnly: true });
            console.log('SafeMeComplaints: Lost & Found →', Object.keys(map).length);
        } catch (e) {
            console.warn('Complaints/All (Lost & Found):', e);
        }

        return Object.keys(map)
            .map(function (k) {
                return map[k];
            })
            .sort(function (a, b) {
                return (parseInt(b.CID, 10) || 0) - (parseInt(a.CID, 10) || 0);
            });
    }

    async function findComplaintByCid(cid) {
        var db = firebase.database();
        var path = 'Complaints/All/' + cid;
        var snap = await db.ref(path).once('value');
        if (!snap.val()) {
            return null;
        }
        return {
            data: snap.val(),
            primaryPath: path,
            nic: snap.val().NIC,
        };
    }

    function writeTargets(cid) {
        return ['Complaints/All/' + cid];
    }

    async function updateComplaintEverywhere(cid, updates) {
        var db = firebase.database();
        await db.ref('Complaints/All/' + cid).update(updates);
    }

    async function deleteComplaintEverywhere(cid) {
        var db = firebase.database();
        var path = 'Complaints/All/' + cid;
        var snap = await db.ref(path).once('value');
        var row = snap.val();
        await db.ref(path).remove();

        if (!row) {
            return;
        }

        var metaSnap = await db.ref('Complaints').once('value');
        var meta = metaSnap.val() || {};
        var updates = {};
        if (row.Type === 'Lost And Found') {
            var lf = Number(meta.LostAndFoundCount) || 0;
            updates.LostAndFoundCount = Math.max(0, lf - 1);
        } else {
            var cc = Number(meta.ComplaintCount) || 0;
            updates.ComplaintCount = Math.max(0, cc - 1);
        }
        if (Object.keys(updates).length) {
            await db.ref('Complaints').update(updates);
        }
    }

    /**
     * Rebuild ComplaintCount / LostAndFoundCount from Complaints/All
     * so the dashboard matches the real list.
     */
    async function recountComplaintCounts() {
        var complaints = await fetchAllComplaintsMerged();
        var lostFound = await fetchAllLostAndFoundMerged();
        var db = firebase.database();
        await db.ref('Complaints').update({
            ComplaintCount: complaints.length,
            LostAndFoundCount: lostFound.length,
        });
        return {
            ComplaintCount: complaints.length,
            LostAndFoundCount: lostFound.length,
        };
    }

    w.SafeMeComplaints = {
        fetchAllComplaintsMerged: fetchAllComplaintsMerged,
        fetchAllLostAndFoundMerged: fetchAllLostAndFoundMerged,
        findComplaintByCid: findComplaintByCid,
        updateComplaintEverywhere: updateComplaintEverywhere,
        deleteComplaintEverywhere: deleteComplaintEverywhere,
        recountComplaintCounts: recountComplaintCounts,
    };
})(window);

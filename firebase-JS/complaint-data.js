/**
 * Complaints — legacy path only: Complaints/All/{CID}
 */
(function (w) {
    var ALL_TIMEOUT_MS = 20000;

    function isComplaintRow(val) {
        return val && typeof val === 'object' && (val.CID != null || val.Type);
    }

    function addComplaint(map, row) {
        if (!isComplaintRow(row)) {
            return;
        }
        if (row.Type === 'Lost And Found') {
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

    function collectFromValue(map, value) {
        if (value == null) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(function (item) {
                addComplaint(map, item);
            });
            return;
        }
        if (typeof value === 'object') {
            Object.keys(value).forEach(function (key) {
                var v = value[key];
                if (isComplaintRow(v)) {
                    addComplaint(map, v);
                } else if (
                    v &&
                    typeof v === 'object' &&
                    key !== 'lastCID' &&
                    key !== 'ComplaintCount' &&
                    key !== 'LostAndFoundCount' &&
                    key !== 'LastCID'
                ) {
                    collectFromValue(map, v);
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
        await db.ref('Complaints/All/' + cid).remove();
    }

    w.SafeMeComplaints = {
        fetchAllComplaintsMerged: fetchAllComplaintsMerged,
        findComplaintByCid: findComplaintByCid,
        updateComplaintEverywhere: updateComplaintEverywhere,
        deleteComplaintEverywhere: deleteComplaintEverywhere,
    };
})(window);

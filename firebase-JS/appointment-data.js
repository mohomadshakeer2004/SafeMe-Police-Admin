/**
 * Public appointments — original path: Appointments/PublicAppointments/{AID}
 * Does not create Appointments/PublicAppointments/Records (that folder may exist
 * from an old admin change; we only read/update it if data is already there).
 */
(function (w) {
    var LEGACY_ROOT = 'Appointments/PublicAppointments';
    var RECORDS_ROOT = 'Appointments/PublicAppointments/Records';
    var SKIP_CHILD_KEYS = { Records: true };

    function isAppointmentRow(val) {
        return val && typeof val === 'object' && val.AID != null;
    }

    function collectFromPublicAppointmentsNode(map, value) {
        if (!value || typeof value !== 'object') {
            return;
        }
        Object.keys(value).forEach(function (key) {
            if (SKIP_CHILD_KEYS[key]) {
                var nested = value[key];
                if (nested && typeof nested === 'object') {
                    Object.keys(nested).forEach(function (aidKey) {
                        var row = nested[aidKey];
                        if (isAppointmentRow(row)) {
                            map[String(row.AID)] = row;
                        }
                    });
                }
                return;
            }
            var row = value[key];
            if (isAppointmentRow(row)) {
                map[String(row.AID)] = row;
            }
        });
    }

    async function fetchAllPublicAppointmentsMerged() {
        var map = {};
        var db = firebase.database();
        try {
            var snap = await db.ref(LEGACY_ROOT).once('value');
            collectFromPublicAppointmentsNode(map, snap.val());
        } catch (e) {
            console.warn(LEGACY_ROOT + ':', e);
        }
        return Object.keys(map)
            .map(function (k) {
                return map[k];
            })
            .sort(function (a, b) {
                return (parseInt(b.AID, 10) || 0) - (parseInt(a.AID, 10) || 0);
            });
    }

    async function findPublicAppointmentByAid(aid) {
        var db = firebase.database();
        var direct = LEGACY_ROOT + '/' + aid;
        var directSnap = await db.ref(direct).once('value');
        if (directSnap.val() && isAppointmentRow(directSnap.val())) {
            return { data: directSnap.val(), primaryPath: direct };
        }

        var recordsPath = RECORDS_ROOT + '/' + aid;
        var recordsSnap = await db.ref(recordsPath).once('value');
        if (recordsSnap.val() && isAppointmentRow(recordsSnap.val())) {
            return { data: recordsSnap.val(), primaryPath: recordsPath };
        }

        return null;
    }

    async function resolvePublicAppointmentWriteTargets(aid) {
        var db = firebase.database();
        var targets = [];
        var direct = LEGACY_ROOT + '/' + aid;
        if ((await db.ref(direct).once('value')).val()) {
            targets.push(direct);
        }
        var recordsPath = RECORDS_ROOT + '/' + aid;
        if ((await db.ref(recordsPath).once('value')).val()) {
            targets.push(recordsPath);
        }
        return targets;
    }

    async function updatePublicAppointmentEverywhere(aid, updates) {
        var db = firebase.database();
        var paths = await resolvePublicAppointmentWriteTargets(aid);
        if (!paths.length) {
            console.warn('No existing public appointment paths for AID', aid);
            return;
        }
        await Promise.all(
            paths.map(function (p) {
                return db.ref(p).update(updates);
            })
        );
    }

    async function deletePublicAppointmentEverywhere(aid) {
        var db = firebase.database();
        var paths = await resolvePublicAppointmentWriteTargets(aid);
        if (!paths.length) {
            console.warn('No existing public appointment paths for AID', aid);
            return;
        }
        await Promise.all(
            paths.map(function (p) {
                return db.ref(p).remove();
            })
        );
        var metaSnap = await db.ref('Appointments').once('value');
        var meta = metaSnap.val() || {};
        var current = Number(meta.PublicAppointmentCount) || 0;
        await db.ref('Appointments').update({
            PublicAppointmentCount: Math.max(0, current - 1),
        });
    }

    /** Rebuild PoliceAppointmentCount from PoliceAppointments children. */
    async function recountPoliceAppointmentCount() {
        var db = firebase.database();
        var snap = await db.ref('Appointments/PoliceAppointments').once('value');
        var total = 0;
        snap.forEach(function (child) {
            var row = child.val();
            if (row && (row.AIDP != null || row.AID != null)) {
                total += 1;
            }
        });
        await db.ref('Appointments').update({
            PoliceAppointmentCount: total,
        });
        return total;
    }

    /** Rebuild PublicAppointmentCount from merged public appointments. */
    async function recountPublicAppointmentCount() {
        var db = firebase.database();
        var rows = await fetchAllPublicAppointmentsMerged();
        var total = rows.length;
        await db.ref('Appointments').update({
            PublicAppointmentCount: total,
        });
        return total;
    }

    w.SafeMeAppointments = {
        fetchAllPublicAppointmentsMerged: fetchAllPublicAppointmentsMerged,
        findPublicAppointmentByAid: findPublicAppointmentByAid,
        updatePublicAppointmentEverywhere: updatePublicAppointmentEverywhere,
        deletePublicAppointmentEverywhere: deletePublicAppointmentEverywhere,
        recountPoliceAppointmentCount: recountPoliceAppointmentCount,
        recountPublicAppointmentCount: recountPublicAppointmentCount,
        LEGACY_ROOT: LEGACY_ROOT,
    };
})(window);

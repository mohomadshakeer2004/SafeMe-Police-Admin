/**
 * Shared admin UI helpers — consistent update popups + theme-aware SweetAlert.
 */
(function (w) {
    var CONFIRM_BTN = '#0c213a';
    var CANCEL_BTN = '#94a3b8';

    function fire(options) {
        if (typeof Swal === 'undefined') {
            window.alert(options.title || options.text || 'Done');
            return Promise.resolve({ isConfirmed: true });
        }
        return Swal.fire(
            Object.assign(
                {
                    confirmButtonColor: CONFIRM_BTN,
                    cancelButtonColor: CANCEL_BTN,
                    buttonsStyling: true,
                },
                options
            )
        );
    }

    w.safemeUi = {
        toastSuccess: function (title, text) {
            return fire({
                icon: 'success',
                title: title || 'Updated successfully',
                text: text || 'Your changes have been saved.',
                timer: 2200,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: 'OK',
            });
        },
        toastError: function (title, text) {
            return fire({
                icon: 'error',
                title: title || 'Update failed',
                text: text || 'Something went wrong. Please try again.',
            });
        },
        toastWarn: function (title, text) {
            return fire({
                icon: 'warning',
                title: title || 'Attention',
                text: text || '',
            });
        },
        confirm: function (title, text, confirmText) {
            return fire({
                icon: 'question',
                title: title || 'Are you sure?',
                text: text || '',
                showCancelButton: true,
                confirmButtonText: confirmText || 'Yes, continue',
                cancelButtonText: 'Cancel',
            });
        },
        updatedThen: function (message, href) {
            return w.safemeUi
                .toastSuccess('Updated successfully', message || 'Record updated.')
                .then(function () {
                    if (href) {
                        window.location.href = href;
                    }
                });
        },
    };
})(window);

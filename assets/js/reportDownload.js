/** PDF download for summary/total report pages (html2pdf). */
(function (w) {
    'use strict';

    function safemeRandomReportNo(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    w.safemeSetReportNumber = function () {
        var numEl = document.getElementById('myNumber');
        if (numEl) {
            numEl.textContent = safemeRandomReportNo(1000, 9999);
        }
    };

    function safemeReportFilename() {
        var title = document.title || 'SafeMe-Report';
        return title.replace(/\|/g, '-').replace(/\s+/g, '-').trim() + '.pdf';
    }

    function safemeGetReportRoot() {
        return (
            document.getElementById('report-export-root') ||
            document.getElementById('htmlToPDF') ||
            document.querySelector('#report-export-root') ||
            document.querySelector('.page-wrapper .cs-invoice') ||
            document.querySelector('.cs-container#htmlToPDF') ||
            document.querySelector('.cs-invoice')
        );
    }

    function getHtml2pdf() {
        if (typeof w.html2pdf === 'function') {
            return w.html2pdf;
        }
        if (w.html2pdf && typeof w.html2pdf.default === 'function') {
            return w.html2pdf.default;
        }
        return null;
    }

    function restoreUi(downloadBtn, btnLabel, prevText, btns, prevDisplay) {
        if (btns) {
            btns.style.display = prevDisplay;
        }
        if (downloadBtn) {
            downloadBtn.disabled = false;
        }
        if (btnLabel) {
            btnLabel.textContent = prevText || 'Download';
        }
    }

    w.safemeDownloadPdf = function () {
        var html2pdfFn = getHtml2pdf();
        if (!html2pdfFn) {
            alert('PDF library not loaded. Check internet connection and refresh the page.');
            return;
        }

        var root = safemeGetReportRoot();
        if (!root) {
            alert('Report content not found.');
            return;
        }

        var downloadBtn = document.getElementById('download');
        var btnLabel = downloadBtn ? downloadBtn.querySelector('span') : null;
        var prevText = btnLabel ? btnLabel.textContent : '';
        var btns = document.querySelector('.cs-invoice_btns');
        var prevDisplay = btns ? btns.style.display : '';

        if (downloadBtn) {
            downloadBtn.disabled = true;
        }
        if (btnLabel) {
            btnLabel.textContent = 'Generating…';
        }
        if (btns) {
            btns.style.display = 'none';
        }

        var opt = {
            margin: 0.4,
            filename: safemeReportFilename(),
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                logging: false,
                scrollY: -w.scrollY
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        try {
            var worker = html2pdfFn().set(opt).from(root);
            var done = worker.save();

            if (done && typeof done.then === 'function') {
                done.then(function () {
                    restoreUi(downloadBtn, btnLabel, prevText, btns, prevDisplay);
                }).catch(function (err) {
                    console.error('PDF export failed:', err);
                    restoreUi(downloadBtn, btnLabel, prevText, btns, prevDisplay);
                    alert('PDF failed. Use Print → Save as PDF.');
                });
            } else {
                setTimeout(function () {
                    restoreUi(downloadBtn, btnLabel, prevText, btns, prevDisplay);
                }, 1500);
            }
        } catch (err) {
            console.error('PDF export failed:', err);
            restoreUi(downloadBtn, btnLabel, prevText, btns, prevDisplay);
            alert('PDF failed. Use Print → Save as PDF.');
        }
    };

    function safemeInitReportDownload() {
        safemeSetReportNumber();

        var downloadBtn = document.getElementById('download');
        if (!downloadBtn) {
            return;
        }

        downloadBtn.classList.remove('hidden', 'd-none');
        downloadBtn.style.display = 'inline-flex';
        downloadBtn.style.visibility = 'visible';
        downloadBtn.type = 'button';
        downloadBtn.removeAttribute('onclick');

        if (!downloadBtn.dataset.safemeBound) {
            downloadBtn.dataset.safemeBound = '1';
            downloadBtn.addEventListener('click', function (e) {
                e.preventDefault();
                w.safemeDownloadPdf();
            });
        }
    }

    w.safemeInitReportDownload = safemeInitReportDownload;

    w.addEventListener('load', safemeInitReportDownload);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        safemeInitReportDownload();
    }
})(window);

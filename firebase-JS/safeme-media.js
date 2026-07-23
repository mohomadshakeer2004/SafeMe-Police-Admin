/**
 * Admin media helpers — Firebase Storage download URLs must not go through
 * HTML onclick attributes (they contain & ? = and get truncated).
 */
(function (w) {
    var PLACEHOLDER = 'assets/images/users/user-1.jpg';

    function isUsableUrl(url) {
        if (url == null) {
            return false;
        }
        var s = String(url).trim();
        if (!s || s === 'null' || s === 'undefined' || s === 'None') {
            return false;
        }
        return (
            s.indexOf('http://') === 0 ||
            s.indexOf('https://') === 0 ||
            s.indexOf('data:image') === 0 ||
            s.indexOf('blob:') === 0 ||
            s.indexOf('assets/') === 0
        );
    }

    function setImg(elOrId, url, options) {
        options = options || {};
        var el =
            typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!el) {
            return false;
        }
        var clean = isUsableUrl(url) ? String(url).trim() : '';
        if (!clean) {
            if (options.hideIfEmpty) {
                el.style.display = 'none';
                el.removeAttribute('src');
            } else if (options.placeholder) {
                el.style.display = '';
                el.setAttribute('src', options.placeholder || PLACEHOLDER);
            }
            return false;
        }
        el.style.display = '';
        el.setAttribute('referrerpolicy', 'no-referrer');
        el.setAttribute('loading', 'lazy');
        el.setAttribute('src', clean);
        el.onerror = function () {
            if (options.placeholder) {
                el.setAttribute('src', options.placeholder || PLACEHOLDER);
            } else if (options.hideIfEmpty) {
                el.style.display = 'none';
            }
        };
        return true;
    }

    function setAudio(elOrId, url) {
        var el =
            typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!el) {
            return false;
        }
        if (!isUsableUrl(url)) {
            el.removeAttribute('src');
            el.style.display = 'none';
            return false;
        }
        el.style.display = '';
        el.setAttribute('src', String(url).trim());
        if (typeof el.load === 'function') {
            el.load();
        }
        return true;
    }

    function bindEvidenceSlot(imgId, url) {
        var img = document.getElementById(imgId);
        if (!img) {
            return false;
        }
        var shown = setImg(img, url, { hideIfEmpty: true });
        if (!shown) {
            return false;
        }
        img.style.cursor = 'pointer';
        img.title = 'Click to open full size';
        img.onclick = function () {
            w.open(String(url).trim(), '_blank', 'noopener');
        };
        return true;
    }

    /**
     * Rebuild a simple evidence gallery (no Flickity) from Image1/Image2/... URLs.
     * Supports https Firebase Storage URLs and data:image inline fallbacks.
     */
    function renderEvidenceGallery(containerId, urls, emptyId) {
        var container = document.getElementById(containerId);
        if (!container) {
            return 0;
        }
        var list = Array.isArray(urls) ? urls : [];
        var usable = [];
        for (var i = 0; i < list.length; i++) {
            if (isUsableUrl(list[i])) {
                usable.push(String(list[i]).trim());
            }
        }

        container.innerHTML = '';
        var emptyEl = emptyId ? document.getElementById(emptyId) : null;
        if (emptyEl) {
            emptyEl.style.display = usable.length ? 'none' : '';
        }

        for (var j = 0; j < usable.length; j++) {
            var url = usable[j];
            var wrap = document.createElement('a');
            wrap.href = url;
            wrap.target = '_blank';
            wrap.rel = 'noopener';
            wrap.className = 'safeme-evidence-item';
            wrap.title = 'Open evidence ' + (j + 1);

            var img = document.createElement('img');
            img.alt = 'Evidence ' + (j + 1);
            img.referrerPolicy = 'no-referrer';
            img.loading = 'lazy';
            img.src = url;
            img.onerror = function () {
                this.parentElement.style.display = 'none';
            };

            wrap.appendChild(img);
            container.appendChild(wrap);
        }
        return usable.length;
    }

    w.safemeMedia = {
        isUsableUrl: isUsableUrl,
        setImg: setImg,
        setAudio: setAudio,
        bindEvidenceSlot: bindEvidenceSlot,
        renderEvidenceGallery: renderEvidenceGallery,
        PLACEHOLDER: PLACEHOLDER,
    };
})(window);

/* ==========================================================
   Smart Health - منطق لوحة التحكم
   ملاحظة: النظام يعمل بالكامل داخل المتصفح (localStorage) بدون خادم،
   فالصلاحيات هنا لتنظيم الواجهة فقط وليست حماية حقيقية للبيانات.
   ========================================================== */
(function () {
    'use strict';

    var SH = window.SH;
    var SESSION_KEY = 'sh_session';
    var DB_KEY = 'sh_db_v1';
    var PREF_KEY = 'sh_prefs';
    var PAGE_SIZE = 8;
    var ROLE_LABEL = { admin: 'مدير النظام', staff: 'موظف', doctor: 'طبيب' };

    /* ---------- التخزين والجلسة ---------- */

    function readJSON(store, key) {
        try {
            var v = store.getItem(key);
            return v ? JSON.parse(v) : null;
        } catch (e) { return null; }
    }

    var session = readJSON(sessionStorage, SESSION_KEY) || readJSON(localStorage, SESSION_KEY);
    if (!session) { location.replace('index.html'); return; }

    var isAdmin = session.role === 'admin';
    var prefs = Object.assign({ theme: 'auto', read: {}, name: '' }, readJSON(localStorage, PREF_KEY) || {});

    function savePrefs() {
        try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* تجاهل */ }
    }

    /* ---------- أدوات صغيرة ---------- */

    var $ = function (sel, root) { return (root || document).querySelector(sel); };

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // توحيد النص العربي للبحث (الهمزات، التاء المربوطة، التشكيل، الأرقام الهندية)
    function norm(s) {
        return String(s == null ? '' : s).toLowerCase()
            .replace(/[\u064B-\u0652\u0640]/g, '')
            .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
            .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
    }

    function fmtDate(v) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
        return m ? m[3] + '/' + m[2] + '/' + m[1] : (v || '—');
    }
    function fmtMonth(v) {
        var m = /^(\d{4})-(\d{2})$/.exec(v || '');
        return m ? m[2] + '/' + m[1] : (v || '—');
    }

    function tone(v) {
        var t = SH.tones;
        if (t.good.indexOf(v) > -1) return 'good';
        if (t.warn.indexOf(v) > -1) return 'warn';
        if (t.bad.indexOf(v) > -1) return 'bad';
        return 'neutral';
    }

    var longDate = new Intl.DateTimeFormat('ar-EG-u-ca-gregory-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var weekday = new Intl.DateTimeFormat('ar-EG-u-ca-gregory-nu-latn', { weekday: 'short' });

    /* ---------- الأقسام ---------- */

    var S = {};
    SH.sections.forEach(function (s) {
        S[s.key] = s;
        s.statusCol = s.columns.filter(function (c) { return c.badge; })[0] || null;
    });

    var PAGES = {
        dashboard: { navLabel: 'الرئيسية', title: 'الرئيسية' },
        reports: { navLabel: 'التقارير والإحصائيات', title: 'التقارير والإحصائيات' },
        notifications: { navLabel: 'الإشعارات', title: 'الإشعارات' },
        settings: { navLabel: 'الإعدادات', title: 'الإعدادات' }
    };

    var NAV = [
        { items: ['dashboard'] },
        { title: 'المرضى والمواعيد', items: ['patients', 'appointments', 'labs', 'complaints'] },
        { title: 'الكوادر', items: ['doctors', 'staff'] },
        { title: 'المنشآت والموارد', items: ['units', 'departments', 'services', 'inventory', 'equipment'] },
        { title: 'الإدارة', items: ['reports', 'notifications', 'users', 'settings'] }
    ];

    function pageInfo(key) { return S[key] || PAGES[key]; }
    function allowed(key) { return !(S[key] && S[key].adminOnly) || isAdmin; }

    /* ---------- قاعدة البيانات المحلية ---------- */

    function applyCompute(s, r) { if (s.compute) s.compute(r); return r; }

    function seedSection(s) {
        return s.seed().map(function (r, i) {
            return applyCompute(s, Object.assign({ _id: s.key + '-' + (i + 1) }, r));
        });
    }

    function seedDB() {
        var out = {};
        SH.sections.forEach(function (s) { out[s.key] = seedSection(s); });
        return out;
    }

    function loadDB() {
        var stored = readJSON(localStorage, DB_KEY);
        if (!stored || typeof stored !== 'object') return seedDB();
        SH.sections.forEach(function (s) {
            if (!Array.isArray(stored[s.key])) stored[s.key] = seedSection(s);
        });
        return stored;
    }

    var db = loadDB();

    function saveDB() {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(db));
        } catch (e) {
            toast('تعذر حفظ البيانات. تأكد من أن المتصفح يسمح بالتخزين المحلي.');
        }
    }
    saveDB();

    function rows(key) { return db[key] || (db[key] = []); }
    function countWhere(key, field, val) {
        return rows(key).filter(function (r) { return r[field] === val; }).length;
    }

    /* ---------- عناصر الصفحة ---------- */

    var main = $('#main');
    var navEl = $('#nav');
    var sidebar = $('#sidebar');
    var scrim = $('#scrim');
    var menuBtn = $('#menuBtn');
    var toastBox = $('#toasts');
    var formDlg = $('#formDialog');
    var confirmDlg = $('#confirmDialog');
    var searchDlg = $('#searchDialog');
    var current = 'dashboard';
    var ui = {};
    var formCtx = null;
    var pendingForm = null;

    function view(key) {
        return ui[key] || (ui[key] = { q: '', sort: null, filter: '', page: 1 });
    }

    /* ---------- الإشعارات الصغيرة (Toast) ---------- */

    function toast(msg, opt) {
        opt = opt || {};
        while (toastBox.children.length >= 3) toastBox.firstChild.remove();
        var t = document.createElement('div');
        t.className = 'toast';
        var span = document.createElement('span');
        span.textContent = msg;
        t.appendChild(span);
        var timer = setTimeout(remove, opt.duration || 3500);
        function remove() { clearTimeout(timer); t.remove(); }
        if (opt.action) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = opt.action;
            b.addEventListener('click', function () { if (opt.onAction) opt.onAction(); remove(); });
            t.appendChild(b);
        }
        toastBox.appendChild(t);
    }

    function confirmBox(o) {
        $('#confirmTitle').textContent = o.title;
        $('#confirmText').textContent = o.text;
        var ok = $('#confirmOk');
        ok.textContent = o.okLabel || 'تأكيد';
        ok.className = 'btn ' + (o.danger ? 'btn-danger' : 'btn-primary');
        confirmDlg.returnValue = '';
        return new Promise(function (resolve) {
            confirmDlg.addEventListener('close', function () {
                resolve(confirmDlg.returnValue === 'ok');
            }, { once: true });
            confirmDlg.showModal();
        });
    }

    /* ---------- القائمة الجانبية ---------- */

    function buildNav() {
        navEl.innerHTML = NAV.map(function (g) {
            var items = g.items.filter(allowed).map(function (k) {
                return '<li><a href="#' + k + '" data-nav="' + k + '"><span>' + esc(pageInfo(k).navLabel) +
                    '</span><span class="nav-count" data-count="' + k + '"></span></a></li>';
            }).join('');
            return (g.title ? '<p class="nav-title">' + esc(g.title) + '</p>' : '') + '<ul>' + items + '</ul>';
        }).join('');
        updateCounts();
    }

    function updateCounts() {
        SH.sections.forEach(function (s) {
            var el = $('[data-count="' + s.key + '"]');
            if (el) el.textContent = rows(s.key).length;
        });
        var unread = unreadNotices().length;
        var n = $('[data-count="notifications"]');
        if (n) {
            n.textContent = unread || '';
            n.classList.toggle('alert', unread > 0);
        }
        var bell = $('#bellCount');
        bell.textContent = unread;
        bell.hidden = unread === 0;
    }

    function setActiveNav() {
        navEl.querySelectorAll('a').forEach(function (a) {
            if (a.dataset.nav === current) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });
    }

    function closeDrawer() {
        sidebar.classList.remove('open');
        scrim.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
    }
    function openDrawer() {
        sidebar.classList.add('open');
        scrim.hidden = false;
        menuBtn.setAttribute('aria-expanded', 'true');
    }

    /* ---------- التوجيه ---------- */

    function route() {
        var key = decodeURIComponent(location.hash.replace('#', '')) || 'dashboard';
        if (!pageInfo(key) || !allowed(key)) key = 'dashboard';
        current = key;
        document.title = pageInfo(key).title + ' | Smart Health';
        if (S[key]) renderDataPage(key);
        else if (key === 'dashboard') renderDashboard();
        else if (key === 'reports') renderReports();
        else if (key === 'notifications') renderNotifications();
        else if (key === 'settings') renderSettings();
        setActiveNav();
        closeDrawer();
        window.scrollTo(0, 0);
        if (pendingForm === key) { pendingForm = null; openForm(key); }
    }

    function goTo(key) {
        if (location.hash === '#' + key) route();
        else location.hash = key;
    }

    /* ---------- صفحات البيانات (جدول + بحث + فرز + تصفية) ---------- */

    function cellText(c, r) {
        var v = r[c.key];
        if (c.type === 'date') return fmtDate(v);
        if (c.type === 'month') return fmtMonth(v);
        return v == null ? '' : v;
    }

    function cellHTML(c, r) {
        var v = r[c.key];
        if (c.badge) return '<span class="badge ' + tone(v) + '">' + esc(v) + '</span>';
        if (c.type === 'tel' || c.type === 'email') return '<bdi dir="ltr">' + esc(v) + '</bdi>';
        if (c.type === 'number') return '<span class="num">' + esc(v) + '</span>';
        return esc(cellText(c, r));
    }

    function searchText(s, r) {
        return s.columns.map(function (c) {
            return r[c.key] + ' ' + cellText(c, r);
        }).join(' ');
    }

    function getRows(key) {
        var s = S[key], v = view(key), q = norm(v.q.trim());
        var list = rows(key).filter(function (r) {
            if (v.filter && s.statusCol && r[s.statusCol.key] !== v.filter) return false;
            return !q || norm(searchText(s, r)).indexOf(q) > -1;
        });
        if (v.sort) {
            var col = s.columns.filter(function (c) { return c.key === v.sort.key; })[0];
            var dir = v.sort.dir === 'desc' ? -1 : 1;
            list = list.slice().sort(function (a, b) {
                var x = a[col.key], y = b[col.key];
                var r = col.type === 'number' ? Number(x) - Number(y) : String(x).localeCompare(String(y), 'ar');
                return r * dir;
            });
        }
        return list;
    }

    function renderDataPage(key) {
        var s = S[key], v = view(key);
        main.innerHTML =
            '<div class="page-head"><div><h1>' + esc(s.title) + '</h1><p>' + esc(s.desc) + '</p></div>' +
            '<button type="button" class="btn btn-primary" data-act="add">' + esc(s.addLabel) + '</button></div>' +
            '<section class="panel">' +
            '<div class="toolbar">' +
            '<div class="search"><label class="sr-only" for="q">بحث في ' + esc(s.title) + '</label>' +
            '<input id="q" type="search" placeholder="ابحث بالاسم أو الكود أو الهاتف" value="' + esc(v.q) + '" autocomplete="off"></div>' +
            '<div class="chips" id="chips" role="group" aria-label="تصفية حسب الحالة"></div>' +
            '<div class="tool-end"><button type="button" class="btn btn-quiet" data-act="export">تصدير CSV</button>' +
            '<button type="button" class="btn btn-quiet" data-act="print">طباعة</button></div>' +
            '</div>' +
            '<div class="table-wrap"><table><thead id="thead"></thead><tbody id="tbody"></tbody></table></div>' +
            '<div class="pager" id="pager"></div>' +
            '</section>';
        refreshTable(key);
    }

    function refreshTable(key) {
        var s = S[key], v = view(key);
        if (current !== key || !$('#tbody')) return;

        // رؤوس الأعمدة
        $('#thead').innerHTML = '<tr>' + s.columns.map(function (c) {
            var sort = v.sort && v.sort.key === c.key ? (v.sort.dir === 'desc' ? 'descending' : 'ascending') : '';
            return '<th' + (sort ? ' aria-sort="' + sort + '"' : '') + '><button type="button" class="sort" data-act="sort" data-key="' + c.key + '">' + esc(c.label) + '</button></th>';
        }).join('') + '<th class="col-actions"><span class="sr-only">إجراءات</span></th></tr>';

        // أزرار التصفية حسب الحالة
        var chips = '';
        if (s.statusCol) {
            var sk = s.statusCol.key;
            var opts = s.statusCol.options || [];
            chips = '<button type="button" class="chip" data-act="chip" data-val="" aria-pressed="' + (v.filter === '') + '">الكل <b>' + rows(key).length + '</b></button>' +
                opts.map(function (o) {
                    var n = countWhere(key, sk, o);
                    if (!n && v.filter !== o) return '';
                    return '<button type="button" class="chip" data-act="chip" data-val="' + esc(o) + '" aria-pressed="' + (v.filter === o) + '">' + esc(o) + ' <b>' + n + '</b></button>';
                }).join('');
        }
        $('#chips').innerHTML = chips;

        // الصفوف
        var list = getRows(key);
        var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        if (v.page > pages) v.page = pages;
        var start = (v.page - 1) * PAGE_SIZE;
        var slice = list.slice(start, start + PAGE_SIZE);
        var colspan = s.columns.length + 1;

        if (!slice.length) {
            var msg = rows(key).length
                ? 'لا توجد نتائج مطابقة. <button type="button" class="link-btn" data-act="clear">مسح البحث والتصفية</button>'
                : 'لا توجد سجلات بعد. <button type="button" class="link-btn" data-act="add">' + esc(s.addLabel) + '</button>';
            $('#tbody').innerHTML = '<tr><td class="empty" colspan="' + colspan + '">' + msg + '</td></tr>';
        } else {
            $('#tbody').innerHTML = slice.map(function (r) {
                return '<tr>' + s.columns.map(function (c) { return '<td>' + cellHTML(c, r) + '</td>'; }).join('') +
                    '<td class="col-actions"><div class="row-actions">' +
                    '<button type="button" class="link-btn" data-act="edit" data-id="' + esc(r._id) + '">تعديل</button>' +
                    (isAdmin ? '<button type="button" class="link-btn danger" data-act="del" data-id="' + esc(r._id) + '">حذف</button>' : '') +
                    '</div></td></tr>';
            }).join('');
        }

        // الترقيم
        $('#pager').innerHTML = list.length <= PAGE_SIZE
            ? (list.length ? '<span>' + list.length + ' من ' + rows(key).length + ' سجل</span>' : '')
            : '<span>عرض ' + (start + 1) + ' إلى ' + (start + slice.length) + ' من ' + list.length + '</span>' +
              '<div><button type="button" class="btn btn-quiet" data-act="goto" data-page="' + (v.page - 1) + '"' + (v.page <= 1 ? ' disabled' : '') + '>السابق</button>' +
              '<button type="button" class="btn btn-quiet" data-act="goto" data-page="' + (v.page + 1) + '"' + (v.page >= pages ? ' disabled' : '') + '>التالي</button></div>';
    }

    /* ---------- نموذج الإضافة والتعديل ---------- */

    function optionsFor(c, currentVal) {
        var list = [];
        if (c.options) list = c.options.slice();
        else if (c.optionsFrom) {
            list = rows(c.optionsFrom.section).map(function (r) { return r[c.optionsFrom.key]; });
            if (c.optionsFrom.extra) list = c.optionsFrom.extra.concat(list);
        }
        list = list.filter(function (v, i) { return v && list.indexOf(v) === i; });
        if (currentVal && list.indexOf(currentVal) === -1) list.push(currentVal);
        return list;
    }

    function fieldHTML(c, rec) {
        var val = rec ? rec[c.key] : (c.default === '@today' ? SH.day(0) : (c.default || ''));
        var id = 'f_' + c.key;
        var control;
        if (c.type === 'select') {
            control = '<select id="' + id + '" name="' + c.key + '" aria-describedby="e_' + c.key + '"><option value="">اختر</option>' +
                optionsFor(c, val).map(function (o) {
                    return '<option value="' + esc(o) + '"' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>';
                }).join('') + '</select>';
        } else {
            var attrs = '';
            if (c.min != null) attrs += ' min="' + c.min + '"';
            if (c.max != null) attrs += ' max="' + c.max + '"';
            if (c.maxlength) attrs += ' maxlength="' + c.maxlength + '"';
            if (c.type === 'tel') attrs += ' inputmode="tel" dir="ltr"';
            if (c.type === 'email') attrs += ' dir="ltr" autocomplete="off"';
            if (c.type === 'number') attrs += ' inputmode="numeric"';
            control = '<input id="' + id + '" name="' + c.key + '" type="' + (c.type || 'text') + '" value="' + esc(val) + '"' + attrs + ' aria-describedby="e_' + c.key + '">';
        }
        return '<div class="field' + (c.full ? ' full' : '') + '"><label for="' + id + '">' + esc(c.label) + '</label>' + control +
            '<p class="err" id="e_' + c.key + '" role="alert"></p></div>';
    }

    function formColumns(s) {
        return s.columns.filter(function (c) { return !c.auto && !c.computed; });
    }

    function openForm(key, id) {
        var s = S[key];
        var rec = id ? rows(key).filter(function (r) { return r._id === id; })[0] : null;
        if (id && !rec) return;
        formCtx = { key: key, id: id || null };
        $('#formTitle').textContent = rec ? 'تعديل ' + rec[s.label] : s.addLabel;
        $('#formSubmit').textContent = rec ? 'حفظ التعديلات' : 'إضافة';
        $('#formFields').innerHTML = formColumns(s).map(function (c) { return fieldHTML(c, rec); }).join('') +
            (s.formNote ? '<p class="note full">' + esc(s.formNote) + '</p>' : '');
        formDlg.showModal();
        var first = $('#formFields input, #formFields select');
        if (first) first.focus();
    }

    function validateField(c, value) {
        if (!value) return 'هذا الحقل مطلوب';
        if (c.type === 'number') {
            var n = Number(value);
            if (isNaN(n)) return 'أدخل رقمًا صحيحًا';
            if ((c.min != null && n < c.min) || (c.max != null && n > c.max)) return 'القيمة يجب أن تكون بين ' + c.min + ' و ' + c.max;
        }
        if (c.pattern && !new RegExp(c.pattern).test(value)) return c.patternMsg || 'الصيغة غير صحيحة';
        if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'البريد الإلكتروني غير صالح';
        if (c.unique && rows(formCtx.key).some(function (r) {
            return r._id !== formCtx.id && String(r[c.key]).toLowerCase() === value.toLowerCase();
        })) return 'هذه القيمة مسجلة بالفعل';
        return '';
    }

    function nextCode(s) {
        var max = 0;
        rows(s.key).forEach(function (r) {
            var m = /(\d+)$/.exec(r.code || '');
            if (m) max = Math.max(max, parseInt(m[1], 10));
        });
        return s.prefix + String(max + 1).padStart(3, '0');
    }

    function submitForm(e) {
        e.preventDefault();
        if (!formCtx) return;
        var s = S[formCtx.key], values = {}, firstBad = null;

        formColumns(s).forEach(function (c) {
            var input = $('#f_' + c.key);
            var v = input.value.trim();
            var err = validateField(c, v);
            $('#e_' + c.key).textContent = err;
            input.toggleAttribute('aria-invalid', !!err);
            if (err && !firstBad) firstBad = input;
            values[c.key] = c.type === 'number' && !err ? Number(v) : v;
        });
        if (firstBad) { firstBad.focus(); return; }

        var wasEdit = !!formCtx.id;
        if (wasEdit) {
            var rec = rows(s.key).filter(function (r) { return r._id === formCtx.id; })[0];
            Object.assign(rec, values);
            applyCompute(s, rec);
        } else {
            var nr = Object.assign({ _id: s.key + '-' + Date.now().toString(36) }, values);
            if (s.columns[0].auto) nr.code = nextCode(s);
            applyCompute(s, nr);
            rows(s.key).push(nr);
            view(s.key).sort = null;
            view(s.key).page = Math.ceil(rows(s.key).length / PAGE_SIZE);
        }
        saveDB();
        formDlg.close();
        refreshAfterChange();
        toast(wasEdit ? 'تم حفظ التعديلات' : 'تمت الإضافة');
    }

    function refreshAfterChange() {
        updateCounts();
        if (S[current]) refreshTable(current);
        else route();
    }

    function deleteRecord(key, id) {
        if (!isAdmin) return;
        var list = rows(key);
        var i = list.findIndex(function (r) { return r._id === id; });
        if (i < 0) return;
        var s = S[key];
        var removed = list.splice(i, 1)[0];
        saveDB();
        refreshAfterChange();
        toast('تم حذف ' + removed[s.label], {
            action: 'تراجع',
            duration: 8000,
            onAction: function () {
                list.splice(Math.min(i, list.length), 0, removed);
                saveDB();
                refreshAfterChange();
                toast('تمت استعادة السجل');
            }
        });
    }

    /* ---------- التصدير ---------- */

    function csvCell(v) {
        v = String(v == null ? '' : v);
        if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; // منع تنفيذ المعادلات داخل Excel
        return '"' + v.replace(/"/g, '""') + '"';
    }

    function download(content, type, name) {
        var url = URL.createObjectURL(new Blob([content], { type: type }));
        var a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 500);
    }

    function exportCSV(key) {
        var s = S[key], list = getRows(key);
        var lines = [s.columns.map(function (c) { return c.label; })].concat(list.map(function (r) {
            return s.columns.map(function (c) { return cellText(c, r); });
        }));
        var csv = '\uFEFF' + lines.map(function (row) { return row.map(csvCell).join(','); }).join('\r\n');
        download(csv, 'text/csv;charset=utf-8', 'smart-health-' + key + '-' + SH.day(0) + '.csv');
        toast('تم تصدير ' + list.length + ' سجل');
    }

    /* ---------- الرئيسية ---------- */

    function attentionItems() {
        var low = rows('inventory').filter(function (r) { return r.status !== 'متوفر'; }).length;
        var eq = rows('equipment').filter(function (r) { return r.status !== 'يعمل'; }).length;
        var un = countWhere('units', 'status', 'تحتاج متابعة');
        var co = countWhere('complaints', 'status', 'قيد المراجعة');
        return [
            { n: low, text: 'أصناف مخزونها منخفض أو نافد', to: 'inventory' },
            { n: eq, text: 'أجهزة تحتاج صيانة أو خارج الخدمة', to: 'equipment' },
            { n: un, text: 'وحدات صحية تحتاج متابعة', to: 'units' },
            { n: co, text: 'شكاوى ومقترحات لم تُراجع', to: 'complaints' }
        ].filter(function (i) { return i.n > 0; });
    }

    function weekChart() {
        var days = [], i;
        for (i = 6; i >= 0; i--) days.push(SH.day(-i));
        var counts = days.map(function (d) {
            return rows('appointments').filter(function (a) { return a.date === d; }).length;
        });
        var top = Math.max(4, Math.ceil(Math.max.apply(null, counts) / 2) * 2);
        var W = 560, H = 230, padT = 26, padB = 34, padX = 12;
        var plotH = H - padT - padB, slot = (W - padX * 2) / 7, bw = Math.min(42, slot * 0.56);
        var out = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="عدد المواعيد في آخر سبعة أيام: ' +
            counts.join('، ') + '">';
        [0, top / 2, top].forEach(function (g) {
            var y = padT + plotH - (g / top) * plotH;
            out += '<line class="grid-line" x1="' + padX + '" x2="' + (W - padX) + '" y1="' + y + '" y2="' + y + '"/>';
        });
        days.forEach(function (d, idx) {
            // الأقدم على اليمين ليناسب اتجاه القراءة العربي
            var x = W - padX - slot * (idx + 1) + (slot - bw) / 2;
            var h = (counts[idx] / top) * plotH;
            var y = padT + plotH - h;
            var isToday = idx === days.length - 1;
            var parts = d.split('-');
            var label = isToday ? 'اليوم' : weekday.format(new Date(+parts[0], +parts[1] - 1, +parts[2]));
            out += '<rect class="bar' + (isToday ? ' today' : '') + '" style="--i:' + idx + '" x="' + x + '" y="' + y + '" width="' + bw + '" height="' + Math.max(h, 2) + '" rx="3"/>' +
                '<text x="' + (x + bw / 2) + '" y="' + (y - 7) + '" text-anchor="middle" class="val">' + counts[idx] + '</text>' +
                '<text x="' + (x + bw / 2) + '" y="' + (H - 12) + '" text-anchor="middle">' + esc(label) + '</text>';
        });
        return out + '</svg>';
    }

    function renderDashboard() {
        var today = SH.day(0);
        var todays = rows('appointments').filter(function (a) { return a.date === today; })
            .sort(function (a, b) { return String(a.time).localeCompare(String(b.time)); });
        var waiting = todays.filter(function (a) { return a.status === 'قيد الانتظار'; }).length;
        var hour = new Date().getHours();
        var first = (prefs.name || session.name || '').trim();

        var figs = [
            { to: 'patients', label: 'المرضى المسجلون', n: rows('patients').length, note: countWhere('patients', 'status', 'تحت المتابعة') + ' تحت المتابعة' },
            { to: 'doctors', label: 'الأطباء', n: rows('doctors').length, note: countWhere('doctors', 'status', 'متاح') + ' متاح الآن' },
            { to: 'units', label: 'الوحدات الصحية', n: rows('units').length, note: countWhere('units', 'status', 'تحتاج متابعة') + ' تحتاج متابعة' },
            { to: 'appointments', label: 'مواعيد اليوم', n: todays.length, note: waiting + ' بانتظار الكشف' }
        ];
        var attn = attentionItems();

        main.innerHTML =
            '<div class="page-head"><div><h1>' + (hour < 12 ? 'صباح الخير' : 'مساء الخير') + (first ? '، ' + esc(first) : '') + '</h1>' +
            '<p>هذا ملخص ما يحدث في الوحدات الصحية اليوم.</p></div>' +
            '<button type="button" class="btn btn-primary" data-act="newappt">حجز موعد</button></div>' +

            '<section class="panel figures" aria-label="ملخص سريع">' + figs.map(function (f) {
                return '<a href="#' + f.to + '"><span class="f-label">' + esc(f.label) + '</span><span class="f-num">' + f.n + '</span><span class="f-note">' + esc(f.note) + '</span></a>';
            }).join('') + '</section>' +

            '<div class="split">' +
            '<section class="panel"><div class="panel-head"><h2>المواعيد خلال آخر 7 أيام</h2></div><div class="panel-body">' + weekChart() + '</div></section>' +
            '<section class="panel"><div class="panel-head"><h2>يحتاج متابعة</h2></div>' +
            (attn.length
                ? '<ul class="attn">' + attn.map(function (i) {
                    return '<li><a href="#' + i.to + '"><span class="attn-n">' + i.n + '</span><span>' + esc(i.text) + '</span></a></li>';
                }).join('') + '</ul>'
                : '<p class="panel-body muted">لا توجد عناصر تحتاج متابعة الآن.</p>') +
            '</section></div>' +

            '<section class="panel"><div class="panel-head"><h2>مواعيد اليوم</h2><a class="link-btn" href="#appointments">كل المواعيد</a></div>' +
            '<div class="table-wrap"><table><thead><tr><th>المريض</th><th>الطبيب</th><th>الوحدة</th><th>الوقت</th><th>الحالة</th></tr></thead><tbody>' +
            (todays.length ? todays.map(function (a) {
                return '<tr><td>' + esc(a.patient) + '</td><td>' + esc(a.doctor) + '</td><td>' + esc(a.unit) + '</td><td><span class="num">' + esc(a.time) +
                    '</span></td><td><span class="badge ' + tone(a.status) + '">' + esc(a.status) + '</span></td></tr>';
            }).join('') : '<tr><td class="empty" colspan="5">لا توجد مواعيد مسجلة اليوم.</td></tr>') +
            '</tbody></table></div></section>';
    }

    /* ---------- الإشعارات (تُحسب من البيانات الحالية) ---------- */

    function buildNotices() {
        var n = [];
        rows('inventory').forEach(function (r) {
            if (r.status === 'متوفر') return;
            n.push({ id: 'inv:' + r._id + ':' + r.status, level: r.status === 'نفد' ? 'bad' : 'warn', to: 'inventory',
                title: r.status === 'نفد' ? 'نفد صنف من المخزون' : 'مخزون منخفض',
                text: r.name + '، المتبقي ' + r.qty + ' ' + r.unit });
        });
        rows('equipment').forEach(function (r) {
            if (r.status === 'يعمل') return;
            n.push({ id: 'eq:' + r._id + ':' + r.status, level: r.status === 'خارج الخدمة' ? 'bad' : 'warn', to: 'equipment',
                title: r.status === 'خارج الخدمة' ? 'جهاز خارج الخدمة' : 'جهاز يحتاج صيانة',
                text: r.name + ' في ' + r.unit + '، آخر صيانة ' + fmtDate(r.lastService) });
        });
        rows('units').forEach(function (r) {
            if (r.status !== 'تحتاج متابعة') return;
            n.push({ id: 'un:' + r._id + ':' + r.status, level: 'warn', to: 'units', title: 'وحدة تحتاج متابعة', text: r.name });
        });
        rows('complaints').forEach(function (r) {
            if (r.status !== 'قيد المراجعة') return;
            n.push({ id: 'co:' + r._id + ':' + r.status, level: 'warn', to: 'complaints',
                title: (r.type === 'مقترح' ? 'مقترح' : 'شكوى') + ' بانتظار المراجعة', text: r.patient + ': ' + r.subject });
        });
        var today = SH.day(0);
        var waiting = rows('appointments').filter(function (a) { return a.date === today && a.status === 'قيد الانتظار'; }).length;
        if (waiting) {
            n.push({ id: 'ap:' + today + ':' + waiting, level: 'info', to: 'appointments',
                title: 'مواعيد اليوم بانتظار الكشف', text: waiting + ' موعد لم يتم بعد' });
        }
        var order = { bad: 0, warn: 1, info: 2 };
        return n.sort(function (a, b) { return order[a.level] - order[b.level]; });
    }

    function unreadNotices() {
        return buildNotices().filter(function (n) { return !prefs.read[n.id]; });
    }

    function renderNotifications() {
        var list = buildNotices();
        var unread = list.filter(function (n) { return !prefs.read[n.id]; }).length;
        main.innerHTML =
            '<div class="page-head"><div><h1>الإشعارات</h1><p>تنبيهات تظهر تلقائيًا من حالة المخزون والأجهزة والوحدات والشكاوى.</p></div>' +
            (unread ? '<button type="button" class="btn" data-act="markall">تعليم الكل كمقروء</button>' : '') + '</div>' +
            '<section class="panel">' + (list.length
                ? '<ul class="notices">' + list.map(function (n) {
                    var read = !!prefs.read[n.id];
                    return '<li class="notice ' + n.level + (read ? '' : ' unread') + '"><a href="#' + n.to + '" data-act="readnote" data-id="' + esc(n.id) + '">' +
                        '<strong>' + esc(n.title) + '</strong><span>' + esc(n.text) + '</span></a></li>';
                }).join('') + '</ul>'
                : '<p class="panel-body muted">لا توجد إشعارات حاليًا.</p>') + '</section>';
    }

    /* ---------- التقارير ---------- */

    function statusSummary(s) {
        if (!s.statusCol) return '—';
        return (s.statusCol.options || []).map(function (o) {
            var n = countWhere(s.key, s.statusCol.key, o);
            return n ? o + ' ' + n : '';
        }).filter(Boolean).join('، ') || '—';
    }

    function distributionHTML(key) {
        var s = S[key], total = rows(key).length;
        if (!total) return '<p class="muted">لا توجد سجلات في هذا القسم.</p>';
        return '<ul class="bars">' + (s.statusCol.options || []).map(function (o) {
            var n = countWhere(key, s.statusCol.key, o);
            var pct = Math.round(n / total * 100);
            return '<li><span class="b-label">' + esc(o) + '</span><span class="b-track"><span class="b-fill ' + tone(o) + '" style="width:' + pct + '%"></span></span><span class="b-val">' + n + ' (' + pct + '%)</span></li>';
        }).join('') + '</ul>';
    }

    function renderReports() {
        var withStatus = SH.sections.filter(function (s) { return s.statusCol && allowed(s.key); });
        var sel = ui.reportKey && S[ui.reportKey] && S[ui.reportKey].statusCol ? ui.reportKey : withStatus[0].key;
        ui.reportKey = sel;
        main.innerHTML =
            '<div class="page-head"><div><h1>التقارير والإحصائيات</h1><p>ملخص لما هو مسجل الآن في كل قسم، مع إمكانية التصدير.</p></div>' +
            '<button type="button" class="btn" data-act="print">طباعة التقرير</button></div>' +
            '<section class="panel"><div class="panel-head"><h2>ملخص الأقسام</h2></div><div class="table-wrap"><table>' +
            '<thead><tr><th>القسم</th><th>عدد السجلات</th><th>توزيع الحالات</th><th class="col-actions"><span class="sr-only">تصدير</span></th></tr></thead><tbody>' +
            SH.sections.filter(function (s) { return allowed(s.key); }).map(function (s) {
                return '<tr><td>' + esc(s.title) + '</td><td><span class="num">' + rows(s.key).length + '</span></td><td>' + esc(statusSummary(s)) +
                    '</td><td class="col-actions"><button type="button" class="link-btn" data-act="exportkey" data-key="' + s.key + '">تصدير CSV</button></td></tr>';
            }).join('') + '</tbody></table></div></section>' +
            '<section class="panel"><div class="panel-head"><h2>توزيع الحالات</h2>' +
            '<label class="sr-only" for="reportSel">القسم</label><select id="reportSel" class="inline-select">' +
            withStatus.map(function (s) { return '<option value="' + s.key + '"' + (s.key === sel ? ' selected' : '') + '>' + esc(s.title) + '</option>'; }).join('') +
            '</select></div><div class="panel-body" id="dist">' + distributionHTML(sel) + '</div></section>';
    }

    /* ---------- الإعدادات ---------- */

    function renderSettings() {
        var name = prefs.name || session.name;
        main.innerHTML =
            '<div class="page-head"><div><h1>الإعدادات</h1><p>بيانات حسابك ومظهر النظام وإدارة البيانات.</p></div></div>' +

            '<section class="panel"><div class="panel-head"><h2>الحساب</h2></div>' +
            '<div class="set-row"><label for="nameInput">الاسم المعروض</label><div class="set-ctl"><input id="nameInput" type="text" value="' + esc(name) + '" maxlength="40">' +
            '<button type="button" class="btn" data-act="savename">حفظ الاسم</button></div></div>' +
            '<div class="set-row"><span>البريد الإلكتروني</span><div class="set-ctl"><bdi dir="ltr">' + esc(session.email) + '</bdi></div></div>' +
            '<div class="set-row"><span>الصلاحية</span><div class="set-ctl">' + esc(ROLE_LABEL[session.role] || session.role) + '</div></div></section>' +

            '<section class="panel"><div class="panel-head"><h2>المظهر</h2></div>' +
            '<div class="set-row"><span>لون الواجهة</span><div class="set-ctl radios" role="radiogroup" aria-label="لون الواجهة">' +
            [['auto', 'حسب الجهاز'], ['light', 'فاتح'], ['dark', 'داكن']].map(function (t) {
                return '<label><input type="radio" name="theme" value="' + t[0] + '"' + (prefs.theme === t[0] ? ' checked' : '') + '> ' + t[1] + '</label>';
            }).join('') + '</div></div></section>' +

            '<section class="panel"><div class="panel-head"><h2>إدارة البيانات</h2></div>' + (isAdmin
                ? '<div class="set-row"><div><span>نسخة احتياطية</span><p class="muted small">تنزيل كل البيانات الحالية في ملف JSON.</p></div><div class="set-ctl"><button type="button" class="btn" data-act="backup">تنزيل النسخة</button></div></div>' +
                  '<div class="set-row"><div><span>استعادة نسخة</span><p class="muted small">يستبدل البيانات الحالية بمحتوى الملف.</p></div><div class="set-ctl"><button type="button" class="btn" data-act="restore">اختيار ملف</button>' +
                  '<input type="file" id="restoreFile" accept="application/json,.json" hidden></div></div>' +
                  '<div class="set-row"><div><span>إعادة البيانات التجريبية</span><p class="muted small">يحذف كل التعديلات ويرجع البيانات الأولية.</p></div><div class="set-ctl"><button type="button" class="btn btn-danger-quiet" data-act="reset">إعادة الضبط</button></div></div>'
                : '<p class="panel-body muted">إدارة البيانات متاحة لمدير النظام فقط.</p>') + '</section>';
    }

    function cleanRecord(s, r, i) {
        var out = { _id: (typeof r._id === 'string' && r._id) ? r._id : s.key + '-i' + i + '-' + Date.now().toString(36) };
        s.columns.forEach(function (c) {
            var v = r[c.key];
            out[c.key] = c.type === 'number' ? (Number(v) || 0) : (v == null ? '' : String(v));
        });
        return applyCompute(s, out);
    }

    function restoreFromFile(file) {
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(reader.result);
                if (!data || typeof data.db !== 'object') throw new Error('bad');
                var count = 0;
                SH.sections.forEach(function (s) {
                    if (Array.isArray(data.db[s.key])) {
                        db[s.key] = data.db[s.key].filter(function (r) { return r && typeof r === 'object'; })
                            .map(function (r, i) { return cleanRecord(s, r, i); });
                        count++;
                    }
                });
                if (!count) throw new Error('empty');
                saveDB(); updateCounts();
                toast('تمت استعادة البيانات');
            } catch (err) {
                toast('الملف غير صالح. اختر نسخة احتياطية نزّلتها من هذا النظام.');
            }
        };
        reader.readAsText(file);
    }

    /* ---------- البحث الشامل ---------- */

    function runGlobalSearch(raw) {
        var out = $('#searchResults'), q = norm(raw.trim());
        if (!q) { out.innerHTML = '<p class="muted pad">اكتب اسم مريض أو طبيب أو رقم هاتف أو كودًا.</p>'; return; }
        var hits = [];
        SH.sections.forEach(function (s) {
            if (!allowed(s.key)) return;
            rows(s.key).forEach(function (r) {
                if (hits.length < 30 && norm(searchText(s, r)).indexOf(q) > -1) hits.push({ s: s, r: r });
            });
        });
        out.innerHTML = hits.length
            ? '<ul>' + hits.map(function (h) {
                var extra = h.s.columns.filter(function (c) { return c.key !== h.s.label && !c.badge && c.type !== 'date' && c.type !== 'month'; })
                    .slice(0, 2).map(function (c) { return h.r[c.key]; }).join('، ');
                return '<li><button type="button" data-go="' + h.s.key + '"><strong>' + esc(h.r[h.s.label]) + '</strong><span>' + esc(h.s.navLabel) + '</span><small>' + esc(extra) + '</small></button></li>';
            }).join('') + '</ul>'
            : '<p class="muted pad">لا توجد نتائج.</p>';
    }

    function openSearch() {
        if (document.querySelector('dialog[open]')) return;
        searchDlg.showModal();
        var input = $('#searchInput');
        input.value = '';
        runGlobalSearch('');
        input.focus();
    }

    /* ---------- الأحداث ---------- */

    main.addEventListener('click', function (e) {
        var t = e.target.closest('[data-act]');
        if (!t) return;
        var act = t.dataset.act, v = S[current] ? view(current) : null;

        switch (act) {
            case 'add': openForm(current); break;
            case 'edit': openForm(current, t.dataset.id); break;
            case 'del': deleteRecord(current, t.dataset.id); break;
            case 'sort':
                if (!v.sort || v.sort.key !== t.dataset.key) v.sort = { key: t.dataset.key, dir: 'asc' };
                else if (v.sort.dir === 'asc') v.sort.dir = 'desc';
                else v.sort = null;
                refreshTable(current); break;
            case 'chip': v.filter = t.dataset.val; v.page = 1; refreshTable(current); break;
            case 'goto': v.page = Number(t.dataset.page); refreshTable(current); break;
            case 'clear': v.q = ''; v.filter = ''; v.page = 1; $('#q').value = ''; refreshTable(current); break;
            case 'export': exportCSV(current); break;
            case 'exportkey': {
                var saved = view(t.dataset.key), keep = { q: saved.q, filter: saved.filter, sort: saved.sort };
                saved.q = ''; saved.filter = ''; saved.sort = null;
                exportCSV(t.dataset.key);
                saved.q = keep.q; saved.filter = keep.filter; saved.sort = keep.sort;
                break;
            }
            case 'print': window.print(); break;
            case 'newappt': pendingForm = 'appointments'; goTo('appointments'); break;
            case 'readnote': prefs.read[t.dataset.id] = true; savePrefs(); updateCounts(); break;
            case 'markall':
                buildNotices().forEach(function (n) { prefs.read[n.id] = true; });
                savePrefs(); updateCounts(); renderNotifications(); break;
            case 'savename': {
                var val = $('#nameInput').value.trim();
                if (!val) { toast('اكتب اسمًا أولًا'); break; }
                prefs.name = val; savePrefs(); $('#userName').textContent = val;
                toast('تم حفظ الاسم'); break;
            }
            case 'backup':
                download(JSON.stringify({ app: 'smart-health', version: 1, exportedAt: new Date().toISOString(), db: db }, null, 2),
                    'application/json', 'smart-health-backup-' + SH.day(0) + '.json');
                toast('تم تنزيل النسخة الاحتياطية'); break;
            case 'restore': $('#restoreFile').click(); break;
            case 'reset':
                confirmBox({ title: 'إعادة البيانات التجريبية؟', text: 'ستُحذف كل السجلات والتعديلات الحالية ولا يمكن التراجع عن ذلك.', okLabel: 'إعادة الضبط', danger: true })
                    .then(function (ok) {
                        if (!ok) return;
                        db = seedDB(); saveDB(); prefs.read = {}; savePrefs(); ui = {};
                        updateCounts(); toast('تمت إعادة البيانات التجريبية');
                    });
                break;
        }
    });

    main.addEventListener('input', function (e) {
        if (e.target.id === 'q' && S[current]) {
            var v = view(current);
            v.q = e.target.value; v.page = 1;
            refreshTable(current);
        }
    });

    main.addEventListener('change', function (e) {
        var t = e.target;
        if (t.name === 'theme') {
            prefs.theme = t.value; savePrefs(); applyTheme();
        } else if (t.id === 'reportSel') {
            ui.reportKey = t.value;
            $('#dist').innerHTML = distributionHTML(t.value);
        } else if (t.id === 'restoreFile' && t.files[0]) {
            restoreFromFile(t.files[0]);
            t.value = '';
        }
    });

    // نماذج
    $('#recordForm').addEventListener('submit', submitForm);
    formDlg.addEventListener('close', function () { formCtx = null; });
    document.querySelectorAll('dialog').forEach(function (d) {
        d.addEventListener('click', function (e) {
            if (e.target === d && d !== confirmDlg) d.close();
            if (e.target.closest('[data-close]')) d.close();
        });
    });

    // البحث الشامل
    $('#searchBtn').addEventListener('click', openSearch);
    $('#searchInput').addEventListener('input', function (e) { runGlobalSearch(e.target.value); });
    $('#searchResults').addEventListener('click', function (e) {
        var b = e.target.closest('[data-go]');
        if (!b) return;
        var key = b.dataset.go, v = view(key);
        v.q = $('#searchInput').value.trim(); v.filter = ''; v.page = 1;
        searchDlg.close();
        goTo(key);
    });

    document.addEventListener('keydown', function (e) {
        var tag = (document.activeElement && document.activeElement.tagName) || '';
        var typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (document.activeElement && document.activeElement.isContentEditable);
        if ((e.key === '/' && !typing && !document.querySelector('dialog[open]')) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
            e.preventDefault(); openSearch();
        }
        if (e.key === 'Escape' && sidebar.classList.contains('open')) closeDrawer();
    });

    // القائمة الجانبية على الموبايل
    menuBtn.addEventListener('click', function () {
        if (sidebar.classList.contains('open')) closeDrawer(); else openDrawer();
    });
    scrim.addEventListener('click', closeDrawer);

    $('#logoutBtn').addEventListener('click', function () {
        try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) { /* تجاهل */ }
        location.replace('index.html');
    });

    window.addEventListener('hashchange', route);

    /* ---------- المظهر ---------- */

    function applyTheme() {
        if (prefs.theme === 'auto') document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', prefs.theme);
    }

    /* ---------- تشغيل ---------- */

    applyTheme();
    $('#userName').textContent = prefs.name || session.name;
    $('#userRole').textContent = ROLE_LABEL[session.role] || '';
    $('#today').textContent = longDate.format(new Date());
    buildNav();
    route();
})();
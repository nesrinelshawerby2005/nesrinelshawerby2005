/* ==========================================================
   Smart Health - تسجيل الدخول
   الحسابات هنا تجريبية داخل الواجهة فقط. في النسخة الحقيقية
   يجب أن يتم التحقق من الخادم وأن تُخزَّن كلمات المرور مشفّرة.
   ========================================================== */
(function () {
    'use strict';

    var SESSION_KEY = 'sh_session';
    var LOCK_KEY = 'sh_lock_until';
    var MAX_ATTEMPTS = 5;
    var LOCK_MS = 30 * 1000;

    var ACCOUNTS = [
        { email: 'admin@gmail.com', password: '123456', name: 'نسرين محمد', role: 'admin' },
        { email: 'staff@gmail.com', password: '123456', name: 'محمد إبراهيم', role: 'staff' },
        { email: 'doctor@gmail.com', password: '123456', name: 'د. سارة أحمد', role: 'doctor' }
    ];

    function readSession(store) {
        try {
            var v = store.getItem(SESSION_KEY);
            return v ? JSON.parse(v) : null;
        } catch (e) { return null; }
    }

    // لو المستخدم مسجل دخول بالفعل ندخله مباشرة
    if (readSession(sessionStorage) || readSession(localStorage)) {
        location.replace('dashboard.html');
        return;
    }

    var form = document.getElementById('loginForm');
    var emailInput = document.getElementById('email');
    var passInput = document.getElementById('password');
    var remember = document.getElementById('remember');
    var message = document.getElementById('message');
    var submitBtn = document.getElementById('submitBtn');
    var togglePw = document.getElementById('togglePw');

    var attempts = 0;
    var timer = null;

    function show(text, kind) {
        message.textContent = text;
        message.className = kind || '';
    }

    function lockedUntil() {
        try { return Number(sessionStorage.getItem(LOCK_KEY)) || 0; } catch (e) { return 0; }
    }

    function startLockCountdown() {
        clearInterval(timer);
        function tick() {
            var left = Math.ceil((lockedUntil() - Date.now()) / 1000);
            if (left <= 0) {
                clearInterval(timer);
                submitBtn.disabled = false;
                attempts = 0;
                show('');
                return;
            }
            submitBtn.disabled = true;
            show('تم إيقاف المحاولة مؤقتًا بسبب كثرة الأخطاء. حاول مرة أخرى بعد ' + left + ' ثانية.', 'error');
        }
        tick();
        timer = setInterval(tick, 1000);
    }

    if (lockedUntil() > Date.now()) startLockCountdown();

    togglePw.addEventListener('click', function () {
        var visible = passInput.type === 'text';
        passInput.type = visible ? 'password' : 'text';
        togglePw.textContent = visible ? 'إظهار' : 'إخفاء';
        togglePw.setAttribute('aria-pressed', String(!visible));
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (lockedUntil() > Date.now()) return;

        var email = emailInput.value.trim().toLowerCase();
        var password = passInput.value;

        emailInput.removeAttribute('aria-invalid');
        passInput.removeAttribute('aria-invalid');

        if (!email) {
            emailInput.setAttribute('aria-invalid', 'true');
            show('اكتب البريد الإلكتروني.', 'error');
            emailInput.focus();
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailInput.setAttribute('aria-invalid', 'true');
            show('صيغة البريد الإلكتروني غير صحيحة.', 'error');
            emailInput.focus();
            return;
        }
        if (!password) {
            passInput.setAttribute('aria-invalid', 'true');
            show('اكتب كلمة المرور.', 'error');
            passInput.focus();
            return;
        }

        var account = ACCOUNTS.filter(function (a) {
            return a.email === email && a.password === password;
        })[0];

        if (!account) {
            attempts++;
            passInput.setAttribute('aria-invalid', 'true');
            if (attempts >= MAX_ATTEMPTS) {
                try { sessionStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_MS)); } catch (err) { /* تجاهل */ }
                startLockCountdown();
            } else {
                show('البريد أو كلمة المرور غير صحيحة. المحاولات المتبقية: ' + (MAX_ATTEMPTS - attempts) + '.', 'error');
            }
            passInput.select();
            return;
        }

        var data = JSON.stringify({ email: account.email, name: account.name, role: account.role });
        try {
            // "تذكرني" يحفظ الجلسة بعد إغلاق المتصفح، وبدونه تنتهي مع إغلاق التبويب
            (remember.checked ? localStorage : sessionStorage).setItem(SESSION_KEY, data);
        } catch (err) {
            show('المتصفح يمنع التخزين المحلي، فعّله ثم أعد المحاولة.', 'error');
            return;
        }

        submitBtn.disabled = true;
        show('تم تسجيل الدخول، جارٍ فتح لوحة التحكم.', 'ok');
        setTimeout(function () { location.replace('dashboard.html'); }, 400);
    });
})();











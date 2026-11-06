(function () {
    const KEY = 'sh_bio_cred';
    const bioBtn = document.getElementById('bioLoginBtn');
    const msg = document.getElementById('message');

    const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
    const fromB64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
    const show = (text) => { if (msg) msg.textContent = text; };

    const getSaved = () => {
        try { return JSON.parse(localStorage.getItem(KEY)); }
        catch { return null; }
    };

    // يرجع null لو مدعوم، أو نص السبب لو مش مدعوم
    async function unsupportedReason() {
        if (!window.isSecureContext) {
            return 'البصمة تحتاج HTTPS أو localhost. افتح الصفحة من سيرفر محلي وليس كملف.';
        }
        if (!window.PublicKeyCredential) {
            return 'المتصفح لا يدعم البصمة (WebAuthn).';
        }
        try {
            const ok = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (!ok) return 'الجهاز لا يحتوي على بصمة أو قفل شاشة مفعّل.';
        } catch {
            return 'تعذر التحقق من دعم البصمة على هذا الجهاز.';
        }
        return null;
    }

    // تفعيل البصمة (تُستدعى بعد نجاح تسجيل الدخول العادي)
    async function enableBiometric(email) {
        const reason = await unsupportedReason();
        if (reason) { show(reason); return false; }

        try {
            const cred = await navigator.credentials.create({
                publicKey: {
                    challenge: crypto.getRandomValues(new Uint8Array(32)),
                    rp: { name: 'Smart Health', id: location.hostname },
                    user: {
                        id: new TextEncoder().encode(email),
                        name: email,
                        displayName: email
                    },
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 },
                        { type: 'public-key', alg: -257 }
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required'
                    },
                    timeout: 60000
                }
            });
            localStorage.setItem(KEY, JSON.stringify({ id: toB64(cred.rawId), email }));
            show('تم تفعيل الدخول بالبصمة بنجاح ✔');
            return true;
        } catch (err) {
            console.error(err);
            show('تم إلغاء تفعيل البصمة أو فشلت العملية.');
            return false;
        }
    }

    // الدخول بالبصمة
    async function loginWithBiometric() {
        show('');
        const reason = await unsupportedReason();
        if (reason) { show(reason); return; }

        const saved = getSaved();
        if (!saved) {
            show('البصمة غير مفعّلة بعد. سجّل الدخول بالبريد وكلمة المرور أولاً ثم وافق على تفعيلها.');
            return;
        }

        try {
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: crypto.getRandomValues(new Uint8Array(32)),
                    rpId: location.hostname,
                    allowCredentials: [{
                        type: 'public-key',
                        id: fromB64(saved.id),
                        transports: ['internal']
                    }],
                    userVerification: 'required',
                    timeout: 60000
                }
            });
            if (assertion) {
                show('تم التحقق بنجاح، جاري الدخول...');
                window.location.href = 'dashboard.html'; // غيّرها لصفحتك
            }
        } catch (err) {
            console.error(err);
            show('فشل التحقق بالبصمة، حاول مرة أخرى.');
        }
    }

    bioBtn.addEventListener('click', loginWithBiometric);
    window.enableBiometric = enableBiometric;
})();
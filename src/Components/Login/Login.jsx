
import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function Login({ onLogin }) {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(
        !!localStorage.getItem("smartHealthEmail")
    );
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [mode, setMode] = useState("login");
    const [success, setSuccess] = useState("");

    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    function getUsers() {
        return JSON.parse(
            localStorage.getItem("smartHealthUsers") || "[]"
        );
    }

    function finishLogin(user) {
        sessionStorage.setItem("smartHealthLoggedIn", "true");
        sessionStorage.setItem(
            "smartHealthUser",
            JSON.stringify(user)
        );

        if (remember) {
            localStorage.setItem("smartHealthEmail", user.email);
        } else {
            localStorage.removeItem("smartHealthEmail");
        }

        if (onLogin) {
            onLogin(user);
        }

        navigate("/Dashboard");
    }

    function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        const email = e.target.email.value.trim().toLowerCase();
        const password = e.target.password.value;

        const users = getUsers();

        const user = users.find(
            item =>
                item.email.toLowerCase() === email &&
                item.password === password
        );

        if (!user) {
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
            setLoading(false);
            return;
        }

        finishLogin(user);
        setLoading(false);
    }

    function handleRegister(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        const name = registerData.name.trim();
        const email = registerData.email.trim().toLowerCase();
        const password = registerData.password;

        if (registerData.password !== registerData.confirmPassword) {
            setError("كلمتا المرور غير متطابقتين.");
            return;
        }

        if (password.length < 6) {
            setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
            return;
        }

        const users = getUsers();

        if (users.some(user => user.email.toLowerCase() === email)) {
            setError("هذا البريد الإلكتروني مسجل بالفعل.");
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password
        };

        localStorage.setItem(
            "smartHealthUsers",
            JSON.stringify([...users, newUser])
        );

        setSuccess("تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.");

        setRegisterData({
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        });

        setMode("login");
    }

    function handleForgotPassword(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        const email = e.target.email.value.trim().toLowerCase();
        const users = getUsers();

        const user = users.find(
            item => item.email.toLowerCase() === email
        );

        if (!user) {
            setError("لا يوجد حساب مسجل بهذا البريد الإلكتروني.");
            return;
        }

        setSuccess(
            `كلمة المرور المسجلة لهذا الحساب هي: ${user.password}`
        );
    }

    function handleSocialLogin(provider) {
        setError(
            `تسجيل الدخول باستخدام ${provider} يحتاج إلى ربط خدمة خارجية.`
        );
    }

    return (
        <div className="login-page">

            <div className="login-container">

                <section className="brand-section">

                    <div className="brand-title">
                        <span>✚ Smart Health</span>
                    </div>

                    <div className="brand-content">

                        <h1>نظام المعلومات الصحي الذكي</h1>

                        <p>
                            متابعة المرضى والمواعيد والمخزون الطبي
                            للوحدات الصحية من مكان واحد.
                        </p>

                    </div>

                </section>

                <section className="form-section">

                    <div className="form-container">

                        <div className="form-header">

                            <h2>
                                {mode === "login" && "تسجيل الدخول"}
                                {mode === "register" && "إنشاء حساب جديد"}
                                {mode === "forgot" && "استعادة كلمة المرور"}
                            </h2>

                            <p>
                                {mode === "login" &&
                                    "الرجاء إدخال بياناتك لتسجيل الدخول"}

                                {mode === "register" &&
                                    "أدخلي بياناتك لإنشاء حساب جديد"}

                                {mode === "forgot" &&
                                    "أدخلي بريدك الإلكتروني للبحث عن حسابك"}
                            </p>

                        </div>

                        {error && (
                            <p
                                role="alert"
                                style={{
                                    color: "#c62828",
                                    fontSize: "13px",
                                    marginBottom: "12px"
                                }}
                            >
                                {error}
                            </p>
                        )}

                        {success && (
                            <p
                                role="status"
                                style={{
                                    color: "#14766e",
                                    fontSize: "13px",
                                    marginBottom: "12px"
                                }}
                            >
                                {success}
                            </p>
                        )}

                        {mode === "login" && (

                            <form onSubmit={handleSubmit}>

                                <div className="form-field">

                                    <label htmlFor="email">
                                        البريد الإلكتروني
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        dir="ltr"
                                        defaultValue={
                                            localStorage.getItem("smartHealthEmail") || ""
                                        }
                                        required
                                    />

                                </div>

                                <div className="form-field">

                                    <label htmlFor="password">
                                        كلمة المرور
                                    </label>

                                    <div className="password-field">

                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            dir="ltr"
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? "إخفاء" : "إظهار"}
                                        </button>

                                    </div>

                                </div>

                                <div className="remember">

                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={remember}
                                        onChange={e =>
                                            setRemember(e.target.checked)
                                        }
                                    />

                                    <label htmlFor="remember">
                                        تذكرني على هذا الجهاز
                                    </label>

                                </div>

                                <button
                                    type="submit"
                                    className="login-button"
                                    disabled={loading}
                                >
                                    {loading ? "جاري الدخول..." : "دخول"}
                                </button>

                                <div className="or-divider">
                                    <span>أو</span>
                                </div>

                                <button
                                    type="button"
                                    className="google-button"
                                    onClick={() => handleSocialLogin("Google")}
                                >
                                    <FcGoogle size={23} />

                                    <span>
                                        تسجيل الدخول باستخدام جوجل
                                    </span>

                                </button>

                                <button
                                    type="button"
                                    className="google-button"
                                    onClick={() => handleSocialLogin("Facebook")}
                                >
                                    <FaFacebook
                                        size={23}
                                        color="#1877F2"
                                    />

                                    <span>
                                        تسجيل الدخول باستخدام فيسبوك
                                    </span>

                                </button>

                            </form>

                        )}

                        {mode === "register" && (

                            <form onSubmit={handleRegister}>

                                <div className="form-field">

                                    <label htmlFor="regName">
                                        الاسم بالكامل
                                    </label>

                                    <input
                                        id="regName"
                                        type="text"
                                        value={registerData.name}
                                        onChange={e =>
                                            setRegisterData({
                                                ...registerData,
                                                name: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="form-field">

                                    <label htmlFor="regEmail">
                                        البريد الإلكتروني
                                    </label>

                                    <input
                                        id="regEmail"
                                        type="email"
                                        dir="ltr"
                                        value={registerData.email}
                                        onChange={e =>
                                            setRegisterData({
                                                ...registerData,
                                                email: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="form-field">

                                    <label htmlFor="regPassword">
                                        كلمة المرور
                                    </label>

                                    <input
                                        id="regPassword"
                                        type="password"
                                        dir="ltr"
                                        value={registerData.password}
                                        onChange={e =>
                                            setRegisterData({
                                                ...registerData,
                                                password: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="form-field">

                                    <label htmlFor="confirmPassword">
                                        تأكيد كلمة المرور
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        dir="ltr"
                                        value={registerData.confirmPassword}
                                        onChange={e =>
                                            setRegisterData({
                                                ...registerData,
                                                confirmPassword: e.target.value
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="login-button"
                                >
                                    إنشاء الحساب
                                </button>

                            </form>

                        )}

                        {mode === "forgot" && (

                            <form onSubmit={handleForgotPassword}>

                                <div className="form-field">

                                    <label htmlFor="forgotEmail">
                                        البريد الإلكتروني
                                    </label>

                                    <input
                                        id="forgotEmail"
                                        name="email"
                                        type="email"
                                        dir="ltr"
                                        required
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="login-button"
                                >
                                    استعادة كلمة المرور
                                </button>

                            </form>

                        )}

                        <div className="login-footer">

                            {mode === "login" && (

                                <>

                                    <p
                                        onClick={() => {
                                            setMode("forgot");
                                            setError("");
                                            setSuccess("");
                                        }}
                                    >
                                        نسيت كلمة المرور؟
                                    </p>

                                    <p>
                                        ليس لديك حساب؟

                                        <span
                                            onClick={() => {
                                                setMode("register");
                                                setError("");
                                                setSuccess("");
                                            }}
                                        >
                                            {" "}سجل الآن
                                        </span>

                                    </p>

                                </>

                            )}

                            {mode !== "login" && (

                                <p
                                    onClick={() => {
                                        setMode("login");
                                        setError("");
                                        setSuccess("");
                                    }}
                                >
                                    العودة إلى تسجيل الدخول
                                </p>

                            )}

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

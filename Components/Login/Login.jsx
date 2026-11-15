
import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {

    function handleSubmit(e) {
        e.preventDefault();
        onLogin();
    }
    const navigate = useNavigate();

function handleSubmit(e) {
    e.preventDefault();
    navigate("/Dashboard");
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
                            <h2>تسجيل الدخول</h2>
                            <p>الرجاء إدخال بياناتك لتسجيل الدخول</p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="form-field">
                                <label htmlFor="email">
                                    البريد الإلكتروني
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    dir="ltr"
                                    autoComplete="username"
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
                                        type="password"
                                        dir="ltr"
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button type="button">
                                        إظهار
                                    </button>
                                </div>
                            </div>

                            <div className="remember">
                                <input
                                    type="checkbox"
                                    id="remember"
                                />

                                <label htmlFor="remember">
                                    تذكرني على هذا الجهاز
                                </label>
                            </div>

                            <button type="submit" className="login-button">
                                دخول
                            </button>

                            <div className="or-divider">
                                <span>أو</span>
                            </div>

                            <button
                                type="button"
                                className="google-button"
                            >
                                تسجيل الدخول باستخدام جوجل
                            </button>

                        </form>

                        <div className="login-footer">
                            <p>نسيت كلمة المرور؟</p>

                            <p>
                                ليس لديك حساب؟
                                <span> سجل الآن</span>
                            </p>
                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

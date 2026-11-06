import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`,
                { email, password }
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            setMessage(
                error.response?.data?.error ||
                "Unable to login. Please check your details."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-brand">
                <div className="brand-logo">S</div>
                <h1>StockFlow</h1>
                <h2>Manage smarter.<br />Grow faster.</h2>
                <p>
                    Your inventory, products and business
                    operations — all in one place.
                </p>

                <div className="brand-stats">
                    <div>
                        <strong>Smart</strong>
                        <span>Inventory</span>
                    </div>
                    <div>
                        <strong>Simple</strong>
                        <span>Management</span>
                    </div>
                    <div>
                        <strong>Fast</strong>
                        <span>Tracking</span>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <form className="auth-form" onSubmit={handleLogin}>

                    <span className="auth-label">WELCOME BACK</span>

                    <h2>Sign in to your account</h2>

                    <p className="auth-description">
                        Enter your details to access your dashboard.
                    </p>

                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {message && (
                        <div className="auth-error">{message}</div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In →"}
                    </button>

                    <p className="auth-footer">
                        Don't have an account?
                        <Link to="/signup"> Create an account</Link>
                    </p>

                    <div className="auth-bottom">
                        © 2026 StockFlow. All rights reserved.
                    </div>

                </form>
            </div>

        </div>
    );
}

export default Login;
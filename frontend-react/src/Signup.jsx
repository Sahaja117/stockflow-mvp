import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/signup",
                {
                    name,
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {
            console.error("Signup error:", error);

            setMessage(
                error.response?.data?.error ||
                error.message ||
                "Signup failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSignup}>
                <h1>StockFlow</h1>
                <h2>Create Account</h2>
                <p>Sign up to manage your inventory</p>

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password (minimum 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>

                {message && <p>{message}</p>}

                <p>
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;
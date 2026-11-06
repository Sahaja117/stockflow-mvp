import React from "react";
import ReactDOM from "react-dom/client";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import App from "./App.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import "./index.css";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <App />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <AppRoutes />
    </React.StrictMode>
);
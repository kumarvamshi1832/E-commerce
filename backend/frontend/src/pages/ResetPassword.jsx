import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [formData, setFormData] = useState({
        otp: "",
        new_password: "",
        confirm_password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email) {
            setError("Email information is missing. Please start again.");
            return;
        }

        if (
            !formData.otp ||
            !formData.new_password ||
            !formData.confirm_password
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "reset-password/",
                {
                    email: email,
                    otp: formData.otp,
                    new_password: formData.new_password,
                    confirm_password: formData.confirm_password,
                }
            );

            setSuccess(response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="reset-password-page">

            <div className="reset-password-card">

                <div className="reset-password-header">

                    <p className="reset-password-label">
                        ACCOUNT RECOVERY
                    </p>

                    <h1>Reset Password</h1>

                    <p>
                        Enter the OTP sent to your email and
                        create a new password.
                    </p>

                    {email && (
                        <div className="reset-email">
                            OTP sent to <strong>{email}</strong>
                        </div>
                    )}

                </div>

                {error && (
                    <div className="reset-password-error">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div className="reset-password-success">
                        ✅ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>OTP</label>

                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter 6-digit OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>

                        <input
                            type="password"
                            name="new_password"
                            placeholder="Enter new password"
                            value={formData.new_password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            name="confirm_password"
                            placeholder="Confirm new password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="reset-password-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Resetting Password..."
                            : "Reset Password"}
                    </button>

                </form>

                <div className="back-to-login">
                    <Link to="/login">
                        ← Back to Login
                    </Link>
                </div>

            </div>

        </main>
    );
}

export default ResetPassword;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      await api.post("forgot-password/", {
        email: email.trim(),
      });

      navigate("/reset-password", {
        state: {
          email: email.trim(),
        },
      });

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">

      <div className="forgot-password-card">

        <div className="forgot-password-header">
          <p className="forgot-password-label">
            ACCOUNT RECOVERY
          </p>

          <h1>Forgot Password?</h1>

          <p>
            Enter your registered email address and
            we'll send you an OTP.
          </p>
        </div>

        {error && (
          <div className="forgot-password-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>

          <button
            type="submit"
            className="forgot-password-button"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;
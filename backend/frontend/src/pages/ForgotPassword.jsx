import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

const vegetables = [
  "🥕", "🥦", "🍅", "🥬", "🫑",
  "🥒", "🌽", "🍆", "🧅", "🥔",
  "🍎", "🍏", "🍋", "🍊", "🥝",
  "🍐", "🍓", "🍇", "🍉", "🍌",
  "🥕", "🥦", "🍅", "🥬", "🫑",
  "🥒", "🌽", "🍆", "🧅", "🥔",
  "🍎", "🍋", "🍊", "🥝", "🍐",
  "🍓", "🍇", "🍉", "🍌", "🥕",
  "🥦", "🍅", "🥬", "🫑", "🥒",
  "🌽", "🍆", "🧅", "🥔", "🍎"
];

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

      <div className="floating-groceries">
        {vegetables.map((vegetable, index) => (
          <span
            key={index}
            className="floating-grocery"
          >
            {vegetable}
          </span>
        ))}
      </div>

      <div className="forgot-password-content">

        <div className="forgot-password-card">

          <div className="forgot-password-icon">
            🔐
          </div>

          <div className="forgot-password-header">

            <p className="forgot-password-label">
              ACCOUNT RECOVERY
            </p>

            <h1>
              Forgot Password?
            </h1>

            <p>
              Enter your registered email address and
              we'll send you an OTP to reset your password.
            </p>

          </div>

          {error && (
            <div className="forgot-password-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="forgot-email">
                Email Address
              </label>

              <div className="forgot-input-wrapper">

                <span className="forgot-input-icon">
                  ✉️
                </span>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                />

              </div>

            </div>

            <button
              type="submit"
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          <div className="forgot-password-divider">
            <span></span>
            <small>SECURE ACCOUNT RECOVERY</small>
            <span></span>
          </div>

          <div className="forgot-password-security">

            <span className="security-icon">
              🛡️
            </span>

            <div>
              <strong>Your account is secure</strong>
              <p>
                We'll send a one-time verification code
                to your registered email.
              </p>
            </div>

          </div>

          <div className="back-to-login">

            <Link to="/login">
              <span>←</span>
              Back to Login
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}

export default ForgotPassword;
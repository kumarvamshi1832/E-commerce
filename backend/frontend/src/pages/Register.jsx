import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);

  const [otpStep, setOtpStep] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "register/",
        formData
      );

      setUserId(response.data.user_id);

      setSuccess(
        "OTP sent successfully. Please check your email."
      );

      setOtpStep(true);

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "verify-registration-otp/",
        {
          user_id: userId,
          otp: otp,
        }
      );

      setSuccess(response.data.message);

      

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    try {
      setResendLoading(true);

      const response = await api.post(
        "resend-registration-otp/",
        {
          user_id: userId,
        }
      );

      setSuccess(response.data.message);

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to resend OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="register-page">

      <div className="register-card">

        <div className="register-header">

          <p className="register-label">
            {otpStep
              ? "EMAIL VERIFICATION"
              : "CREATE YOUR ACCOUNT"}
          </p>

          <h1>
            {otpStep
              ? "Verify your email"
              : "Join us"}
          </h1>

          <p>
            {otpStep
              ? `Enter the OTP sent to ${formData.email}`
              : "Create an account and start shopping."}
          </p>

        </div>

        {error && (
          <div className="register-message error-message">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="register-message success-message">
            ✅ {success}
          </div>
        )}

        {!otpStep ? (

          <form onSubmit={handleRegister}>

            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Sending OTP..."
                : "Create Account"}
            </button>

          </form>

        ) : (

          <form onSubmit={handleVerifyOTP}>

            <div className="form-group">

              <label>Verification OTP</label>

              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="Enter 6 digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "");

                  setOtp(value);
                  setError("");
                }}
              />

            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify Email"}
            </button>

            <button
              type="button"
              className="resend-button"
              onClick={handleResendOTP}
              disabled={resendLoading}
            >
              {resendLoading
                ? "Sending..."
                : "Resend OTP"}
            </button>

          </form>

        )}

        <div className="login-link">

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Register;
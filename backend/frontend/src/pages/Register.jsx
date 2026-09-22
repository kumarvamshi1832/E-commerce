import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  registerUser,
  verifyRegistrationOTP,
  resendRegistrationOTP,
} from "../services/api";
import "./Register.css";

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

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    referral_code: "",
  });

  

  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");

  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const referralCode = searchParams.get("ref");

    if (referralCode) {
      setFormData((previousData) => ({
        ...previousData,
        referral_code: referralCode.toUpperCase(),
      }));
    }
  }, [searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(formData);

      setUserId(response.data.user_id);
      setShowOTP(true);

      setMessage(
        response.data.message ||
          "Registration successful. Please verify your email with the OTP."
      );
    } catch (error) {
      console.log("Registration error:", error);

      setError(
        error.response?.data?.error ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyRegistrationOTP({
        user_id: userId,
        otp: otp,
      });

      setMessage(
        response.data.message ||
          "Email verified successfully. You can now login."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log("OTP verification error:", error);

      setError(
        error.response?.data?.error ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setMessage("");

    if (!userId) {
      setError("Unable to resend OTP. Please register again.");
      return;
    }

    setResending(true);

    try {
      const response = await resendRegistrationOTP({
        user_id: userId,
      });

      setMessage(
        response.data.message ||
          "A new OTP has been sent to your email."
      );
    } catch (error) {
      console.log("Resend OTP error:", error);

      setError(
        error.response?.data?.error ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="register-page">


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
    
      <div className="register-container">

        {!showOTP ? (
          <>
            <div className="register-header">
              <p className="register-label">MY-STORE</p>

              <h1>Create Account</h1>

              <p>
                Create your account and start shopping with us.
              </p>
            </div>

            <form
              className="register-form"
              onSubmit={handleRegister}
            >

              <div className="form-group">
                <label>Username</label>

                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>

                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label>
                  Referral Code (optional)
                  <span className="optional-label">
                    
                  </span>
                </label>

                <input
                  type="text"
                  name="referral_code"
                  placeholder="Enter referral code"
                  value={formData.referral_code}
                  onChange={handleChange}
                  autoComplete="off"
                />

                {formData.referral_code && (
                  <small className="referral-detected">
                    Referral code applied
                  </small>
                )}
              </div>

              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="register-message">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

              <div className="register-login-link">
                Already have an account?

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>

            </form>
          </>
        ) : (
          <>
            <div className="register-header">
              <p className="register-label">MY-STORE</p>

              <h1>Verify Your Email</h1>

              <p>
                Enter the OTP sent to your email address.
              </p>
            </div>

            <form
              className="register-form"
              onSubmit={handleVerifyOTP}
            >

              <div className="form-group">
                <label>OTP</label>

                <input
                  type="text"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="register-message">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify Email"}
              </button>

              <button
                type="button"
                className="resend-otp-button"
                onClick={handleResendOTP}
                disabled={resending}
              >
                {resending
                  ? "Sending..."
                  : "Resend OTP"}
              </button>

              <button
                type="button"
                className="back-register-button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
              >
                Back to Registration
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default Register;
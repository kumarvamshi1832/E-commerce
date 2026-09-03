import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "login/",
        formData
      );

      setSuccess(response.data.message);

      // Save the logged-in user for now.
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-card">

        <div className="login-header">

          <p className="login-label">
            WELCOME BACK
          </p>

          <h1>Login</h1>

          <p>
            Sign in to continue shopping.
          </p>

        </div>

        {error && (
          <div className="login-message error-message">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="login-message success-message">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <div className="register-link">

          Don't have an account?{" "}

          <Link to="/register">
            Create an account
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Login;
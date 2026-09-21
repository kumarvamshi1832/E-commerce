import { useEffect, useState } from "react";
import api from "../services/api";
import "./Profile.css";

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

function Profile() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("me/");

      setUser(response.data);

      setFormData({
        username: response.data.username,
        email: response.data.email,
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      setError(
        error.response?.data?.error ||
        "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
    });

    setMessage("");
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
    });

    setMessage("");
    setEditing(false);
  };

  const handleUpdateProfile = async () => {
    if (!formData.username.trim()) {
      setMessage("Username is required.");
      return;
    }

    if (!formData.email.trim()) {
      setMessage("Email is required.");
      return;
    }

    if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await api.put("me/", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setUser(response.data.user);

      const oldUser = JSON.parse(
        localStorage.getItem("user")
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          username: response.data.user.username,
          email: response.data.user.email,
        })
      );

      setFormData({
        username: response.data.user.username,
        email: response.data.user.email,
        password: "",
        confirmPassword: "",
      });

      setEditing(false);

      setMessage(
        response.data.message ||
        "Profile updated successfully."
      );

    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">

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

        <div className="profile-state">
          <div className="profile-loading-icon">
            👤
          </div>

          <p className="profile-loading">
            Loading profile...
          </p>
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">

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

        <div className="profile-state">

          <div className="profile-error-icon">
            ⚠️
          </div>

          <div className="profile-error">
            {error}
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="profile-page">

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

      <div className="profile-content">

        <div className="profile-card">

          <div className="profile-header">

            <div className="profile-avatar">
              {user?.username
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-header-text">
              <p className="profile-label">
                ACCOUNT SETTINGS
              </p>

              <h1>My Profile</h1>

              <p>
                Manage your account information
              </p>
            </div>

          </div>

          {!editing ? (

            <>

              <div className="profile-details">

                <div className="profile-field">

                  <div className="profile-field-icon">
                    👤
                  </div>

                  <div className="profile-field-content">

                    <span className="profile-label">
                      Username
                    </span>

                    <span className="profile-value">
                      {user.username}
                    </span>

                  </div>

                </div>

                <div className="profile-field">

                  <div className="profile-field-icon">
                    ✉️
                  </div>

                  <div className="profile-field-content">

                    <span className="profile-label">
                      Email Address
                    </span>

                    <span className="profile-value">
                      {user.email}
                    </span>

                  </div>

                </div>

                <div className="profile-field">

                  <div className="profile-field-icon">
                    🆔
                  </div>

                  <div className="profile-field-content">

                    <span className="profile-label">
                      User ID
                    </span>

                    <span className="profile-value">
                      #{user.id}
                    </span>

                  </div>

                </div>

              </div>

              <button
                type="button"
                className="edit-profile-button"
                onClick={handleEdit}
              >
                <span>✏️</span>
                Edit Profile
              </button>

              {message && (
                <p className="profile-message success">
                  ✓ {message}
                </p>
              )}

            </>

          ) : (

            <div className="profile-edit-form">

              <div className="profile-edit-heading">
                <h2>Edit Profile</h2>

                <p>
                  Update your account information below.
                </p>
              </div>

              <div className="profile-input-group">

                <label htmlFor="username">
                  Username
                </label>

                <div className="profile-input-wrapper">

                  <span>👤</span>

                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                  />

                </div>

              </div>

              <div className="profile-input-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="profile-input-wrapper">

                  <span>✉️</span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />

                </div>

              </div>

              <div className="profile-input-group">

                <label htmlFor="password">
                  New Password
                </label>

                <div className="profile-input-wrapper">

                  <span>🔒</span>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                  />

                </div>

              </div>

              <div className="profile-input-group">

                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="profile-input-wrapper">

                  <span>🔐</span>

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                  />

                </div>

              </div>

              <div className="profile-password-note">
                <span>🛡️</span>
                <p>
                  Leave the password fields blank if you don't
                  want to change your current password.
                </p>
              </div>

              <div className="profile-actions">

                <button
                  type="button"
                  className="save-profile-button"
                  onClick={handleUpdateProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="profile-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      ✓ Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="cancel-profile-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

              {message && (
                <p className="profile-message error">
                  ⚠️ {message}
                </p>
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Profile;
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Profile.css";

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

  // =========================
  // FETCH PROFILE
  // =========================

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

  // =========================
  // EDIT PROFILE
  // =========================

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

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  // =========================
  // CANCEL
  // =========================

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

  // =========================
  // UPDATE PROFILE
  // =========================

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

      // Update profile on screen
      setUser(response.data.user);

      // Update localStorage
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

      // Clear password fields
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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="profile-page">
        <p className="profile-loading">
          Loading profile...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          {error}
        </div>
      </div>
    );
  }

  // =========================
  // PROFILE
  // =========================

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* PROFILE HEADER */}

        <div className="profile-header">

          <div className="profile-avatar">
            {user?.username
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h1>My Profile</h1>

            <p>
              Manage your account information
            </p>
          </div>

        </div>


        {/* =========================
            VIEW MODE
        ========================= */}

        {!editing ? (

          <>
            <div className="profile-details">

              <div className="profile-field">
                <span className="profile-label">
                  Username
                </span>

                <span className="profile-value">
                  {user.username}
                </span>
              </div>


              <div className="profile-field">
                <span className="profile-label">
                  Email
                </span>

                <span className="profile-value">
                  {user.email}
                </span>
              </div>


              <div className="profile-field">
                <span className="profile-label">
                  User ID
                </span>

                <span className="profile-value">
                  #{user.id}
                </span>
              </div>

            </div>


            {/* EDIT BUTTON */}

            <button
              type="button"
              className="edit-profile-button"
              onClick={handleEdit}
            >
              ✏️ Edit Profile
            </button>


            {message && (
              <p className="profile-message">
                {message}
              </p>
            )}

          </>

        ) : (

          /* =========================
             EDIT MODE
          ========================= */

          <div className="profile-edit-form">

            {/* USERNAME */}

            <div className="profile-input-group">

              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
              />

            </div>


            {/* EMAIL */}

            <div className="profile-input-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />

            </div>


            {/* PASSWORD */}

            <div className="profile-input-group">

              <label htmlFor="password">
                New Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="profile-input-group">

              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />

            </div>


            {/* BUTTONS */}

            <div className="profile-actions">

              <button
                type="button"
                className="save-profile-button"
                onClick={handleUpdateProfile}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
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
              <p className="profile-message">
                {message}
              </p>
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Profile;
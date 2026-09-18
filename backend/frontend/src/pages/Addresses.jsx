import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAddresses, addAddress, deleteAddress, updateAddress } from "../services/api";
import "./Addresses.css";

function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingAddress, setEditingAddress] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    address_type: "home",
    is_default: false,
  });

  const loadAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.log("Address error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEdit = (address) => {
  setEditingAddress(address);
  setFormData({
    full_name: address.full_name,
    phone: address.phone,
    address_line1: address.address_line1,
    address_line2: address.address_line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    landmark: address.landmark,
    address_type: address.address_type,
    is_default: address.is_default,
  });
  setShowForm(true);
};

  const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    if (editingAddress) {
      await updateAddress(editingAddress.id, formData);
    } else {
      await addAddress(formData);
    }

    setFormData({
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      address_type: "home",
      is_default: false,
    });

    setEditingAddress(null);
    setShowForm(false);

    loadAddresses();
  } catch (error) {
    console.log("Address error:", error);
    alert(error.response?.data?.error || "Failed to save address.");
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await deleteAddress(id);
      loadAddresses();
    } catch (error) {
      console.log("Delete address error:", error);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await updateAddress(id, {
        is_default: true,
      });

      loadAddresses();
    } catch (error) {
      console.log("Default address error:", error);
    }
  };

  if (loading) {
    return <div className="addresses-page">Loading addresses...</div>;
  }

  return (
    <div className="addresses-page">

      <div className="addresses-header">
        <div>
          <h1>My Addresses</h1>
          <p>Manage your delivery addresses</p>
        </div>

        <button
          className="add-address-button"
          onClick={() => setShowForm(!showForm)}
        >
          + Add New Address
        </button>
      </div>

      {showForm && (
        <form
          className="address-form"
          onSubmit={handleSubmit}
        >
         <h2>
  {editingAddress ? "Edit Address" : "Add New Address"}
</h2>

          <div className="address-form-grid">

            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              required
            />

            <input
              type="text"
              name="address_line1"
              placeholder="Address Line 1"
              value={formData.address_line1}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="address_line2"
              placeholder="Address Line 2"
              value={formData.address_line2}
              onChange={handleChange}
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength="6"
              required
            />

            <input
              type="text"
              name="landmark"
              placeholder="Landmark"
              value={formData.landmark}
              onChange={handleChange}
            />

          </div>

          <div className="address-type">

            <label>Address Type</label>

            <select
              name="address_type"
              value={formData.address_type}
              onChange={handleChange}
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>

          </div>

          <label className="default-checkbox">

            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
            />

            Set as default address

          </label>

          <div className="address-form-actions">

            <button
              type="submit"
              className="save-address-button"
            >
              Save Address
            </button>

            <button
              type="button"
              className="cancel-address-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {addresses.length === 0 ? (
        <div className="no-addresses">
          <h2>No addresses saved</h2>
          <p>Add an address to make checkout faster.</p>
        </div>
      ) : (
        <div className="address-list">

          {addresses.map((address) => (
            <div
              className="address-card"
              key={address.id}
            >

              <div className="address-card-header">

                <div>
                  <span className="address-type-badge">
                    {address.address_type}
                  </span>

                  {address.is_default && (
                    <span className="default-badge">
                      Default
                    </span>
                  )}
                </div>

              </div>

              <h3>{address.full_name}</h3>

              <p>{address.phone}</p>

              <p>{address.address_line1}</p>

              {address.address_line2 && (
                <p>{address.address_line2}</p>
              )}

              <p>
                {address.city}, {address.state} - {address.pincode}
              </p>

              {address.landmark && (
                <p>Landmark: {address.landmark}</p>
              )}

              <div className="address-actions">

  {!address.is_default && (
    <button
      onClick={() =>
        handleSetDefault(address.id)
      }
    >
      Set as Default
    </button>
  )}

  <button
    onClick={() =>
      handleEdit(address)
    }
  >
    Edit
  </button>

  <button
    className="delete-address-button"
    onClick={() =>
      handleDelete(address.id)
    }
  >
    Delete
  </button>

</div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Addresses;
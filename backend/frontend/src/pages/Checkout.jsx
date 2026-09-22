import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api, { getAddresses, getWallet } from "../services/api";
import BalloonEffect from "../components/BalloonEffect";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [showBalloons, setShowBalloons] = useState(false);
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const [pin, setPin] = useState("");
  const [location, setLocation] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const [deliveryStatus, setDeliveryStatus] = useState({});
  const [checkingDelivery, setCheckingDelivery] = useState(false);

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

  useEffect(() => {
    loadAddresses();
    loadWallet();
  }, []);

  const loadWallet = async () => {
  try {
    const response = await getWallet();

    setWalletBalance(
      Number(response.data?.balance || 0)
    );
  } catch (error) {
    console.error("Wallet loading error:", error);
    setWalletBalance(0);
  }
};

  const loadAddresses = async () => {
    try {
      setAddressLoading(true);

      const response = await getAddresses();
      const loadedAddresses = response.data || [];

      setAddresses(loadedAddresses);

      const defaultAddress = loadedAddresses.find(
        (address) => address.is_default
      );

      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setPin(String(defaultAddress.pincode));
        checkPincode(String(defaultAddress.pincode));
      } else if (loadedAddresses.length > 0) {
        setSelectedAddress(loadedAddresses[0]);
        setPin(String(loadedAddresses[0].pincode));
        checkPincode(String(loadedAddresses[0].pincode));
      }
    } catch (error) {
      console.error("Address loading error:", error);
      setError("Unable to load your saved addresses.");
    } finally {
      setAddressLoading(false);
    }
  };

  const selectAddress = async (address) => {
    setSelectedAddress(address);
    setPin(String(address.pincode));
    setLocation(null);
    setPinError("");
    setError("");
    setDeliveryStatus({});

    setShowAddressSelection(false);

    await checkPincode(String(address.pincode));
  };

  const checkCartDelivery = async (enteredPincode) => {
    try {
      setCheckingDelivery(true);

      const response = await api.get(
        `delivery/check/?pincode=${enteredPincode}`
      );

      const status = {};

      response.data.products.forEach((item) => {
        status[item.product_id] = item.deliverable;
      });

      setDeliveryStatus(status);

      return status;
    } catch (error) {
      console.error("Delivery check error:", error);
      setDeliveryStatus({});
      return null;
    } finally {
      setCheckingDelivery(false);
    }
  };

  const checkPincode = async (value) => {
    if (value.length !== 6) {
      return;
    }

    try {
      setPinLoading(true);
      setPinError("");

      const response = await fetch(
        `https://api.postalpincode.in/pincode/${value}`
      );

      const data = await response.json();

      if (
        !data[0] ||
        data[0].Status !== "Success" ||
        !data[0].PostOffice?.length
      ) {
        setPinError("Invalid pincode");
        setLocation(null);
        setDeliveryStatus({});
        return;
      }

      const firstOffice = data[0].PostOffice[0];

      setLocation({
        postOffice: firstOffice.Name,
        district: firstOffice.District,
        state: firstOffice.State,
      });

      await checkCartDelivery(value);
    } catch (error) {
      console.error("Pincode error:", error);
      setPinError("Unable to check pincode. Please try again.");
    } finally {
      setPinLoading(false);
    }
  };

  const handlePincodeChange = async (e) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "").slice(0, 6);

    setPin(value);
    setLocation(null);
    setPinError("");
    setError("");
    setDeliveryStatus({});

    if (value.length !== 6) {
      return;
    }

    await checkPincode(value);
  };

  const applyCoupon = (code) => {
    const coupon = String(code || couponCode).trim().toUpperCase();

    if (coupon === "SAVE10") {
      setCouponCode("SAVE10");
      setAppliedCoupon("SAVE10");
      setDiscountPercent(10);
      setCouponMessage("10% discount applied!");
    } else if (coupon === "SAVE20") {
      setCouponCode("SAVE20");
      setAppliedCoupon("SAVE20");
      setDiscountPercent(20);
      setCouponMessage("20% discount applied!");
    } else if (coupon === "SAVE30") {
      setCouponCode("SAVE30");
      setAppliedCoupon("SAVE30");
      setDiscountPercent(30);
      setCouponMessage("30% discount applied!");
    } else {
      setAppliedCoupon("");
      setDiscountPercent(0);
      setCouponMessage("Invalid coupon code.");
    }
  };

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const delivery =
    subtotal > 0 && location
      ? pin.startsWith("500")
        ? 40
        : 140
      : 0;

  const discountAmount =
  (subtotal * discountPercent) / 100;

const orderTotal =
  subtotal + delivery - discountAmount;

const walletDeduction = useWallet
  ? Math.min(walletBalance, orderTotal)
  : 0;

const payableAmount =
  orderTotal - walletDeduction;
  
  const unavailableItems = cart.filter(
    (item) => deliveryStatus[item.id] === false
  );

  const hasUndeliverableItems = unavailableItems.length > 0;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address.");
      setShowAddressSelection(true);
      return;
    }

    if (pin.length !== 6) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!location) {
      setError("Please enter a valid pincode before placing the order.");
      return;
    }

    if (String(selectedAddress.pincode) !== String(pin)) {
      setError(
        "Selected address pincode and delivery pincode must match."
      );
      return;
    }

    const status = await checkCartDelivery(pin);

    if (!status) {
      setError(
        "Unable to check delivery availability. Please try again."
      );
      return;
    }

    const unavailableProducts = cart.filter(
      (item) => status[item.id] === false
    );

    if (unavailableProducts.length > 0) {
      const productNames = unavailableProducts
        .map((item) => item.name)
        .join(", ");

      setError(
        `${productNames} ${
          unavailableProducts.length === 1 ? "is" : "are"
        } not deliverable to ${pin}.`
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const response = await api.post("orders/", {
  items: orderItems,
  coupon_code: appliedCoupon,
  pincode: pin,
  address_id: selectedAddress.id,
  use_wallet: useWallet,
});

      console.log("Order created:", response.data);

      clearCart();
      setShowBalloons(true);

      setTimeout(() => {
        navigate("/");
      }, 4000);
    } catch (error) {
      console.error("Order error:", error);

      if (error.response?.data?.non_deliverable_products) {
        const products =
          error.response.data.non_deliverable_products;

        const productNames = products
          .map((item) => item.product_name)
          .join(", ");

        setError(
          `${productNames} ${
            products.length === 1 ? "is" : "are"
          } not deliverable to ${
            error.response.data.pincode || pin
          }.`
        );
      } else {
        setError(
          error.response?.data?.error ||
            "Failed to place order. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !showBalloons) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>

          <h1>Your cart is empty</h1>

          <p>Add some products before checking out.</p>

          <Link to="/products">
            Continue Shopping →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="floating-groceries">
        {vegetables.map((vegetable, index) => (
          <span key={index} className="floating-grocery">
            {vegetable}
          </span>
        ))}
      </div>

      {showBalloons && <BalloonEffect />}

      {showBalloons ? (
        <div className="order-success">
          <div className="order-success-content">
            <div className="success-icon">🎉</div>

            <h1>Order Placed!</h1>

            <p>
              Your order has been placed successfully.
            </p>

            <p>
              Redirecting you shortly...
            </p>
          </div>
        </div>
      ) : (
        <div className="checkout-container">

          <div className="checkout-header">
            <div className="checkout-header-meta">
              <p className="checkout-eyebrow">
                FINAL STEP
              </p>

              <h1>Checkout</h1>

              <p>
                Review your order before placing it.
              </p>
            </div>

            <span className="checkout-step-pill">
              <strong>{cart.length}</strong> item
              {cart.length === 1 ? "" : "s"} in cart
            </span>
          </div>

          {error && (
            <div className="checkout-error">
              <span className="checkout-error-icon">
                ⚠️
              </span>

              <span>{error}</span>
            </div>
          )}

          <div className="checkout-layout">

            <section className="checkout-card checkout-items">

              <div className="checkout-card-head">
                <h2>Your Items</h2>

                <span className="checkout-count-badge">
                  {cart.length}
                </span>
              </div>

              {cart.map((item) => (
                <article
                  className="checkout-item"
                  key={item.id}
                >
                  <div className="checkout-item-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>🛒</span>
                    )}
                  </div>

                  <div className="checkout-item-info">

                    <h3>{item.name}</h3>

                    <p className="checkout-item-price">
                      ₹{Number(item.price).toFixed(2)}
                    </p>

                    {pin.length === 6 &&
                      deliveryStatus[item.id] !==
                        undefined && (
                        <p
                          className={
                            deliveryStatus[item.id]
                              ? "checkout-deliverable"
                              : "checkout-not-deliverable"
                          }
                        >
                          {deliveryStatus[item.id]
                            ? `✓ Deliverable to ${pin}`
                            : `✕ Not deliverable to ${pin}`}
                        </p>
                      )}

                    <div className="checkout-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>
                  </div>

                  <strong className="checkout-item-total">
                    ₹
                    {(
                      Number(item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </strong>
                </article>
              ))}
            </section>

            <div className="checkout-options-grid">

              <section className="checkout-card checkout-option-card coupon-card">

                <div className="option-card-icon">
                  🏷️
                </div>

                <div className="option-card-title">

                  <p className="option-eyebrow">
                    SAVE MORE
                  </p>

                  <h2>Apply Coupon</h2>

                </div>

                <div className="coupon-input-row">

                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyCoupon(e.target.value);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      applyCoupon(couponCode)
                    }
                  >
                    Apply
                  </button>

                </div>

                <div className="coupon-buttons">

                  <button
                    type="button"
                    onClick={() =>
                      applyCoupon("SAVE10")
                    }
                  >
                    SAVE10
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyCoupon("SAVE20")
                    }
                  >
                    SAVE20
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyCoupon("SAVE30")
                    }
                  >
                    SAVE30
                  </button>

                </div>

                {couponMessage && (
                  <p className="coupon-message">
                    {couponMessage}
                  </p>
                )}
              </section>

              <section className="checkout-card checkout-option-card selected-address-option">

                <div className="option-card-icon">
                  📍
                </div>

                <div className="option-card-title">

                  <p className="option-eyebrow">
                    DELIVER TO
                  </p>

                  <h2>Delivery Address</h2>

                </div>

                {addressLoading ? (
                  <div className="address-option-loading">
                    Loading address...
                  </div>
                ) : selectedAddress ? (
                  <div className="selected-address-preview">

                    <div className="selected-preview-top">

                      <strong>
                        {selectedAddress.full_name}
                      </strong>

                      <span>
                        {selectedAddress.is_default
                          ? "DEFAULT"
                          : selectedAddress.address_type}
                      </span>

                    </div>

                    <p>
                      {selectedAddress.address_line1}

                      {selectedAddress.address_line2
                        ? `, ${selectedAddress.address_line2}`
                        : ""}
                    </p>

                    <p>
                      {selectedAddress.city},{" "}
                      {selectedAddress.state} -{" "}
                      {selectedAddress.pincode}
                    </p>

                    <p>
                      {selectedAddress.phone}
                    </p>

                    <button
                      type="button"
                      className="change-address-button"
                      onClick={() =>
                        setShowAddressSelection(
                          true
                        )
                      }
                    >
                      Change Address
                    </button>

                  </div>
                ) : (
                  <div className="address-option-empty">

                    <p>
                      No delivery address selected.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddressSelection(true)
                      }
                    >
                      Select Address
                    </button>

                  </div>
                )}

              </section>

              <section className="checkout-card checkout-option-card pincode-card">

                <div className="option-card-icon">
                  📮
                </div>

                <div className="option-card-title">

                  <p className="option-eyebrow">
                    DELIVERY CHECK
                  </p>

                  <h2>Pincode</h2>

                </div>

                <label htmlFor="checkout-pincode">
                  Enter delivery pincode
                </label>

                <input
                  id="checkout-pincode"
                  className="pincode-input"
                  type="text"
                  value={pin}
                  onChange={handlePincodeChange}
                  maxLength="6"
                  placeholder="Enter 6 digit pincode"
                />

                {pinLoading && (
                  <p className="pincode-status">
                    Checking pincode...
                  </p>
                )}

                {checkingDelivery && (
                  <p className="pincode-status">
                    Checking product delivery...
                  </p>
                )}

                {location && (
                  <div className="pincode-location">

                    <p>
                      📍 <strong>Post Office:</strong>{" "}
                      {location.postOffice}
                    </p>

                    <p>
                      🏙️ <strong>District:</strong>{" "}
                      {location.district}
                    </p>

                    <p>
                      🗺️ <strong>State:</strong>{" "}
                      {location.state}
                    </p>

                  </div>
                )}

                {pinError && (
                  <p className="pincode-error">
                    ⚠️ {pinError}
                  </p>
                )}

              </section>

            </div>

            {showAddressSelection && (
              <section
                id="saved-addresses"
                className="checkout-card checkout-address-section"
              >

                <div className="address-section-header">

                  <div>
                    <p className="option-eyebrow">
                      YOUR ADDRESSES
                    </p>

                    <h2>Select Delivery Address</h2>

                    <p className="address-section-subtitle">
                      Choose where you want your order
                      delivered.
                    </p>
                  </div>

                  <div className="address-section-actions">

                    <button
                      type="button"
                      className="add-address-top-button"
                      onClick={() =>
                        navigate("/addresses")
                      }
                    >
                      + Add New Address
                    </button>

                    <button
                      type="button"
                      className="close-address-button"
                      onClick={() =>
                        setShowAddressSelection(false)
                      }
                      aria-label="Close address selection"
                    >
                      ×
                    </button>

                  </div>

                </div>

                {addressLoading ? (
                  <div className="address-loading-box">
                    Loading your saved addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="no-address">

                    <div className="no-address-icon">
                      📍
                    </div>

                    <p>
                      No saved addresses found.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/addresses")
                      }
                    >
                      Add Address
                    </button>

                  </div>
                ) : (
                  <div className="address-list">

                    {addresses.map((address, index) => (
                      <div
                        key={address.id}
                        className={`checkout-address-card ${
                          selectedAddress?.id ===
                          address.id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          selectAddress(address)
                        }
                      >

                        <div className="address-number">
                          {index + 1}
                        </div>

                        <span className="address-radio-dot" />

                        <div className="address-card-content">

                          <div className="address-card-header">

                            <strong>
                              {address.full_name}
                            </strong>

                            <div className="address-tags">

                              {address.is_default && (
                                <span className="default-address-tag">
                                  DEFAULT
                                </span>
                              )}

                              <span className="address-type-tag">
                                {address.address_type}
                              </span>

                            </div>

                          </div>

                          <div className="address-details">

                            <p>
                              {address.phone}
                            </p>

                            <p>
                              {address.address_line1}

                              {address.address_line2
                                ? `, ${address.address_line2}`
                                : ""}
                            </p>

                            <p>
                              {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}
                            </p>

                            {address.landmark && (
                              <p>
                                Landmark:{" "}
                                {address.landmark}
                              </p>
                            )}

                          </div>

                          {selectedAddress?.id ===
                            address.id && (
                            <div className="selected-address">
                              ✓ Selected for delivery
                            </div>
                          )}

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </section>
            )}

            <aside className="checkout-card checkout-summary">

              <div className="summary-header">

                <div>
                  <p className="option-eyebrow">
                    PAYMENT DETAILS
                  </p>

                  <h2>Order Summary</h2>
                </div>

                <span className="summary-lock">
                  🔒
                </span>

              </div>

              <div className="checkout-row">
                <span>Subtotal</span>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>
              </div>

              <div className="checkout-row">

                <span>Delivery</span>

                <strong>
                  {pin.length === 0 || !location
                    ? "—"
                    : `₹${delivery.toFixed(2)}`}
                </strong>

              </div>

              {discountPercent > 0 && (
                <>
                  <div className="checkout-row discount-row">

                    <span>
                      Coupon ({appliedCoupon})
                    </span>

                    <strong>
                      -₹{discountAmount.toFixed(2)}
                    </strong>

                  </div>

                  <div className="checkout-row original-total-row">

                    <span>
                      Original Total
                    </span>

                    <strong>
                      ₹
                      {(
                        subtotal + delivery
                      ).toFixed(2)}
                    </strong>

                  </div>

                  <div className="checkout-row saved-row">

                    <span>You Save</span>

                    <strong>
                      ₹
                      {discountAmount.toFixed(2)}
                    </strong>

                  </div>

                  <div className="coupon-success">

                    <span>🎉</span>

                    <span>
                      Congrats! You saved ₹
                      {discountAmount.toFixed(2)}{" "}
                      with{" "}
                      <strong>
                        {appliedCoupon}
                      </strong>
                      !
                    </span>

                  </div>
                </>
              )}

              <div className="checkout-wallet-section">

  <div className="checkout-wallet-header">

    <div>
      <p className="option-eyebrow">
        MY WALLET
      </p>

      <h3>Use Wallet Balance</h3>
    </div>

    <span className="checkout-wallet-balance">
      ₹{walletBalance.toFixed(2)}
    </span>

  </div>

  {walletBalance > 0 ? (
    <label className="checkout-wallet-checkbox">

      <input
        type="checkbox"
        checked={useWallet}
        onChange={(e) =>
          setUseWallet(e.target.checked)
        }
      />

      <span>
        Use wallet balance for this order
      </span>

    </label>
  ) : (
    <p className="checkout-wallet-empty">
      Your wallet balance is ₹0.00
    </p>
  )}

</div>

<div className="checkout-divider" />

<div className="checkout-row">

  <span>Order Total</span>

  <strong>
    ₹{orderTotal.toFixed(2)}
  </strong>

</div>

{walletDeduction > 0 && (
  <div className="checkout-row wallet-deduction-row">

    <span>Wallet Used</span>

    <strong>
      -₹{walletDeduction.toFixed(2)}
    </strong>

  </div>
)}

<div className="checkout-total">

  <span>
    {payableAmount === 0
      ? "Amount to Pay"
      : "Amount to Pay"}
  </span>

  <strong>
    ₹{payableAmount.toFixed(2)}
  </strong>

</div>

{walletDeduction > 0 && (
  <div className="wallet-success-message">

    <span>💰</span>

    <span>
      ₹{walletDeduction.toFixed(2)} will be
      deducted from your wallet.
    </span>

  </div>
)}
              {hasUndeliverableItems && (
                <div className="checkout-delivery-warning">

                  <span>⚠️</span>

                  <span>
                    Some products cannot be delivered
                    to {pin}. Please remove them or
                    choose another pincode.
                  </span>

                </div>
              )}

              <button
                className="place-order-button"
                onClick={handlePlaceOrder}
                disabled={
                  loading ||
                  checkingDelivery ||
                  hasUndeliverableItems
                }
              >
                {loading
                  ? "Placing Order..."
                  : checkingDelivery
                  ? "Checking Delivery..."
                  : hasUndeliverableItems
                  ? "Delivery Unavailable"
                  :  "Place Order"}
              </button>

              <Link
                to="/cart"
                className="back-to-cart"
              >
                ← Back to Cart
              </Link>

            </aside>

          </div>
        </div>
      )}
    </main>
  );
}

export default Checkout;
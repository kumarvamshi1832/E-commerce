import axios from "axios";

const api = axios.create({
  baseURL: "https://e-commerce-ao9w.onrender.com/api/",
  // baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export const getNotifications = () => {
  return api.get("notifications/");
};

export const markNotificationRead = (notificationId) => {
  return api.patch(`notifications/${notificationId}/read/`);
};

export const markAllNotificationsRead = () => {
  return api.patch("notifications/read-all/");
};

export const getAddresses = () => {
  return api.get("addresses/");
};

export const addAddress = (addressData) => {
  return api.post("addresses/", addressData);
};

export const updateAddress = (addressId, addressData) => {
  return api.patch(`addresses/${addressId}/`, addressData);
};

export const deleteAddress = (addressId) => {
  return api.delete(`addresses/${addressId}/`);
};

export const registerUser = (data) => {
  return api.post("register/", data);
};

export const verifyRegistrationOTP = (data) => {
  return api.post("verify-registration-otp/", data);
};

export const resendRegistrationOTP = (data) => {
  return api.post("resend-registration-otp/", data);
};

export const getWishlist = () => {
  return api.get("wishlist/");
};

export const addToWishlist = (productId) => {
  return api.post(`wishlist/add/${productId}/`);
};

export const removeFromWishlist = (productId) => {
  return api.delete(`wishlist/remove/${productId}/`);
};

export const getWallet = () => api.get("wallet/");

export const getWalletTransactions = () =>
  api.get("wallet/transactions/");

export const getReferralDetails = () =>
  api.get("referral/");

export default api;
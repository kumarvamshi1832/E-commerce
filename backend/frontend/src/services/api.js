// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://e-commerce-ao9w.onrender.com/api/",
//   // baseURL: "http://127.0.0.1:8000/api/",
//   withCredentials: true,
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://e-commerce-ao9w.onrender.com/api/",
  //  baseURL: "http://127.0.0.1:8000/api/",
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

export default api;
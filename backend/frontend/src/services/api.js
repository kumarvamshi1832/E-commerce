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
  withCredentials: true,
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export default api;
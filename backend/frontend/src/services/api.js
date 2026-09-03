import axios from "axios";

const api = axios.create({
  baseURL: "https://e-commerce-ao9w.onrender.com/api/",
  withCredentials: true,
});

export default api;
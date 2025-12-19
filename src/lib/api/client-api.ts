import axios from "axios";

export const clientApi = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://dessy69-new-backend.onrender.com/api"
      : "https://localhost:5000/api",
  withCredentials: true, // ✅ browser sends cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

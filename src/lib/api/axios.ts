import axios from "axios";
import https from "https";

export const createApi = (serverCookies?: any) => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:5000/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    // httpsAgent:
    //   process.env.NODE_ENV === "development"
    //     ? new https.Agent({ rejectUnauthorized: false })
    //     : undefined,
  });

  api.interceptors.request.use((config) => {
       console.log('Request:', config.method?.toUpperCase(), config.url);
    if (serverCookies && typeof serverCookies.get === "function") {
      // SSR: attach Authorization header manually
      const token = serverCookies.get("token")?.value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res.data,
    (error) => Promise.reject(error.response?.data || error)
  );

  return api;
};

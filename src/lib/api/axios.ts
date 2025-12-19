import axios from "axios";
import https from "https";

export const createApi = (serverCookies?: any) => {
  // Determine the correct base URL
  const getBaseURL = () => {
    // 1. If explicitly set, use it
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // 2. In production (server-side), use same domain
    if (typeof window === "undefined" && process.env.VERCEL_URL) {
      return `${process.env.VERCEL_URL}`;
    }

    // 3. In production (client-side), use relative path
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      return "/api";
    }

    // 4. Development fallback
    return "https://localhost:5000/api";
  };
  const api = axios.create({
    baseURL: getBaseURL(),
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
    console.log("Request:", config.method?.toUpperCase(), config.url);
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

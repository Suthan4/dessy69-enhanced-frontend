// lib/api/server-api.ts
import axios from "axios";
import { cookies } from "next/headers";

export const createServerApi = async () => {
  // Get token from Next.js cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token"); 

  const baseURL =
    process.env.NODE_ENV === "production"
      ? "https://dessy69-new-backend.onrender.com/api"
      : "https://localhost:5000/api";

  console.log("🔧 [Server API] Creating axios instance");
  console.log("   baseURL:", baseURL);
  console.log("   Token:", token ? "EXISTS ✅" : "MISSING ❌");

  return axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      // ✅ CRITICAL: Send token as Authorization header
      ...(token && { Authorization: `Bearer ${token.value}` }),

      Cookie: token?.value, // ✅ SSR auth fixed
    },
  });
};

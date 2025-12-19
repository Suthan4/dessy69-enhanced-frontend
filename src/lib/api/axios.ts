// import axios from "axios";
// import https from "https";
// import { cookies } from "next/headers";

// export const createApi = async (serverCookies?: any) => {
//   const baseURL =
//     process.env.NODE_ENV === "production"
//       ? "https://dessy69-new-backend.onrender.com/api"
//       : "https://localhost:5000/api";

//   // 🔥 Read cookies from Next.js request
//   const cookieStore = await cookies();
//   const cookieHeader = cookieStore
//     .getAll()
//     .map((c: any) => `${c.name}=${c.value}`)
//     .join("; ");

//   console.log("baseURL", baseURL);
//   console.log("SSR Cookie header:", cookieHeader);

//   const api = axios.create({
//     baseURL,
//     withCredentials: true,
//     headers: {
//       "Content-Type": "application/json",
//       Cookie: cookieHeader,
//     },
//     // httpsAgent:
//     //   process.env.NODE_ENV === "development"
//     //     ? new https.Agent({ rejectUnauthorized: false })
//     //     : undefined,
//   });

//   api.interceptors.request.use((config) => {
//     console.log("Request:", config.method?.toUpperCase(), config.url);
//     // if (serverCookies && typeof serverCookies.get === "function") {
//     //   // SSR: attach Authorization header manually
//     //   const token = serverCookies.get("token")?.value;
//     //   if (token) {
//     //     config.headers.Authorization = `Bearer ${token}`;
//     //   }
//     // }
//     // ✅ SSR: forward cookies exactly as-is
//     if (serverCookies && typeof serverCookies.toString === "function") {
//       config.headers.Cookie = serverCookies.toString();
//     }
//     return config;
//   });

//   api.interceptors.response.use(
//     (res) => res.data,
//     (error) => Promise.reject(error.response?.data || error)
//   );

//   return api;
// };

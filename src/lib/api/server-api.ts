// import axios from "axios";
// import { cookies } from "next/headers";

// export const createServerApi = async () => {
//   const baseURL = "https://dessy69-new-backend.onrender.com/api";
//   const testBaseUrl =  process.env.NODE_ENV === "production"
//       ? "https://dessy69-new-backend.onrender.com/api"
//       : "https://localhost:5000/api";
//   console.log("testBaseUrl", testBaseUrl);
  

//   const cookieStore = await cookies();
//   const cookieHeader = cookieStore
//     .getAll()
//     .map((c) => `${c.name}=${c.value}`)
//     .join("; ");

//   return axios.create({
//     baseURL,
//     timeout: 15000,
//     withCredentials: true, // 🔥 REQUIRED
//     headers: {
//       "Content-Type": "application/json",
//       Cookie: cookieHeader, // ✅ SSR auth fixed
//     },
//   });
// };
import axios from "axios";
import { headers } from "next/headers";

export const createServerApi = async () => {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? "https://dessy69-new-backend.onrender.com/api"
      : "http://localhost:5000/api";

  const headersList = headers();
  const cookieHeader = (await headersList).get("cookie") || "";

  return axios.create({
    baseURL: "/api",
    timeout: 15000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  });
};

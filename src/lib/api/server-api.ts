// import axios from "axios";
// import { headers } from "next/headers";

// export const createServerApi = async () => {
//   const baseURL =
//     process.env.NODE_ENV === "production"
//       ? "https://dessy69-new-backend.onrender.com/api"
//       : "http://localhost:5000/api";

//   const headersList = headers();
//   const cookieHeader = (await headersList).get("cookie") || "";

//   return axios.create({
//     baseURL: "/api",
//     timeout: 15000,
//     withCredentials: true,
//     headers: {
//       "Content-Type": "application/json",
//       ...(cookieHeader && { Cookie: cookieHeader }),
//     },
//   });
// };
import axios from "axios";

export const createServerApi = () => {
  return axios.create({
    baseURL: "/api", // 🔥 IMPORTANT: same-origin
    timeout: 15000,
    withCredentials: true, // send cookies automatically
    headers: {
      "Content-Type": "application/json",
    },
  });
};

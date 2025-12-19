import axios from "axios";
import { cookies } from "next/headers";

export const createServerApi = async () => {
  const baseURL =
    process.env.NODE_ENV === "production"
      ? "https://dessy69-new-backend.onrender.com/api"
      : "https://localhost:5000/api";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader, // ✅ SSR auth fixed
    },
  });
};

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://dessy69-new-backend.onrender.com"
    : "https://localhost:5000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { proxy } = req.query;
  const path = Array.isArray(proxy) ? proxy.join("/") : proxy;
  const url = `${BACKEND_URL}/api/${path}`;

  console.log(`🔄 [API Proxy] ${req.method} /api/${path}`);
  console.log(`📍 [Backend URL] ${url}`);
  console.log(`🍪 [Incoming Cookies]`, req.cookies);

  try {
    // Forward the request to your backend
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      params: req.query.proxy ? undefined : req.query, // Don't forward proxy param
      headers: {
        "Content-Type": "application/json",
        // Forward cookies from the incoming request
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
        // Forward other relevant headers
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization,
        }),
      },
      withCredentials: true,
      validateStatus: () => true, // Don't throw on any status
    });

    console.log(`✅ [Backend Response] ${response.status}`);

    // Forward Set-Cookie headers from backend to client
    const setCookieHeaders = response.headers["set-cookie"];
    if (setCookieHeaders) {
      console.log(`🍪 [Setting Cookies]`, setCookieHeaders);
      res.setHeader("Set-Cookie", setCookieHeaders);
    }

    // Forward the response
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`❌ [Proxy Error]`, {
      message: error.message,
      url: url,
      status: error.response?.status,
    });

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

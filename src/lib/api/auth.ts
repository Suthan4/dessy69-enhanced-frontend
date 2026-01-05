import { AuthResponse, LoginCredentials, RegisterData, User } from "../types/auth";
import { ApiResponse } from "../types/common";
import { clientApi } from "./client-api";

export const authApi = () => ({
  login: async (
    credentials: LoginCredentials,
    signal?: AbortSignal
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await clientApi.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
      { signal }
    );
    return response.data;
  },
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await clientApi.post<any, ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    return response.data!;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await clientApi.get<any, ApiResponse<User>>("/auth/me");
    return response.data!;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
});

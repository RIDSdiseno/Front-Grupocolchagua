import axios from "axios";
import type { LoginRequest, LoginResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const loginRequest = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/auth/login`,
    data
  );

  return response.data;
};
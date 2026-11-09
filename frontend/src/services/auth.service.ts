import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
} from "../types/auth.types";

class AuthService {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      data
    );

    return response.data;
  }

  async me() {
    const response = await api.get<MeResponse>(
      ENDPOINTS.AUTH.ME
    );

    return response.data;
  }
}

export const authService = new AuthService();
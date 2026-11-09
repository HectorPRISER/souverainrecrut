import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

import type {
  UsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "../types/user.types";

class UserService {
  async getAll(
    page = 1,
    limit = 10
  ) {
    const response = await api.get<UsersResponse>(
      `${ENDPOINTS.USERS}?page=${page}&limit=${limit}`
    );

    return response.data;
  }

  async getById(id: string) {
    const response = await api.get<{
      success: boolean;
      data: User;
    }>(`${ENDPOINTS.USERS}/${id}`);

    return response.data;
  }

  async create(data: CreateUserRequest) {
    const response = await api.post<{
      success: boolean;
      data: User;
    }>(ENDPOINTS.USERS, data);

    return response.data;
  }

  async update(
    id: string,
    data: UpdateUserRequest
  ) {
    const response = await api.put<{
      success: boolean;
      data: User;
    }>(`${ENDPOINTS.USERS}/${id}`, data);

    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete<{
      success: boolean;
      data: User;
    }>(`${ENDPOINTS.USERS}/${id}`);

    return response.data;
  }
}

export const userService = new UserService();
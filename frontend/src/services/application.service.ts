import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

import type {
  ApplicationResponse,
  ApplicationsResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from "../types/application.types";

class ApplicationService {
  async getAll(
    page = 1,
    limit = 10
  ) {
    const response =
      await api.get<ApplicationsResponse>(
        `${ENDPOINTS.APPLICATIONS}?page=${page}&limit=${limit}`
      );

    return response.data;
  }

  async getById(id: string) {
    const response =
      await api.get<ApplicationResponse>(
        `${ENDPOINTS.APPLICATIONS}/${id}`
      );

    return response.data;
  }

  async create(
    data: CreateApplicationRequest
  ) {
    const response =
      await api.post<ApplicationResponse>(
        ENDPOINTS.APPLICATIONS,
        data
      );

    return response.data;
  }

  async update(
    id: string,
    data: UpdateApplicationRequest
  ) {
    const response =
      await api.put<ApplicationResponse>(
        `${ENDPOINTS.APPLICATIONS}/${id}`,
        data
      );

    return response.data;
  }

  async delete(id: string) {
    const response =
      await api.delete<ApplicationResponse>(
        `${ENDPOINTS.APPLICATIONS}/${id}`
      );

    return response.data;
  }
}

export const applicationService =
  new ApplicationService();
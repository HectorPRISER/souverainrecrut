import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

import type {
  JobResponse,
  JobsResponse,
  CreateJobRequest,
  UpdateJobRequest,
} from "../types/job.types";

class JobService {
  async getAll(
    page = 1,
    limit = 10
  ) {
    const response =
      await api.get<JobsResponse>(
        `${ENDPOINTS.JOBS}?page=${page}&limit=${limit}`
      );

    return response.data;
  }

  async getById(id: string) {
    const response =
      await api.get<JobResponse>(
        `${ENDPOINTS.JOBS}/${id}`
      );

    return response.data;
  }

  async create(
    data: CreateJobRequest
  ) {
    const response =
      await api.post<JobResponse>(
        ENDPOINTS.JOBS,
        data
      );

    return response.data;
  }

  async update(
    id: string,
    data: UpdateJobRequest
  ) {
    const response =
      await api.put<JobResponse>(
        `${ENDPOINTS.JOBS}/${id}`,
        data
      );

    return response.data;
  }

  async delete(id: string) {
    const response =
      await api.delete<JobResponse>(
        `${ENDPOINTS.JOBS}/${id}`
      );

    return response.data;
  }
}

export const jobService =
  new JobService();
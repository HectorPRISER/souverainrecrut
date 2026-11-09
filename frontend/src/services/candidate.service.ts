import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

import type {
  CandidateResponse,
  CandidatesResponse,
  CreateCandidateRequest,
  UpdateCandidateRequest,
} from "../types/candidate.types";

class CandidateService {
  async getAll(
    page = 1,
    limit = 10
  ) {
    const response =
      await api.get<CandidatesResponse>(
        `${ENDPOINTS.CANDIDATES}?page=${page}&limit=${limit}`
      );

    return response.data;
  }

  async getById(id: string) {
    const response =
      await api.get<CandidateResponse>(
        `${ENDPOINTS.CANDIDATES}/${id}`
      );

    return response.data;
  }

  async create(
    data: CreateCandidateRequest
  ) {
    const response =
      await api.post<CandidateResponse>(
        ENDPOINTS.CANDIDATES,
        data
      );

    return response.data;
  }

  async update(
    id: string,
    data: UpdateCandidateRequest
  ) {
    const response =
      await api.put<CandidateResponse>(
        `${ENDPOINTS.CANDIDATES}/${id}`,
        data
      );

    return response.data;
  }

  async delete(id: string) {
    const response =
      await api.delete<CandidateResponse>(
        `${ENDPOINTS.CANDIDATES}/${id}`
      );

    return response.data;
  }
}

export const candidateService =
  new CandidateService();
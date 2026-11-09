import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

import type {
  DashboardResponse,
} from "../types/dashboard.types";

class DashboardService {
  async getStats() {
    const response =
      await api.get<DashboardResponse>(
        ENDPOINTS.DASHBOARD
      );

    return response.data;
  }
}

export const dashboardService =
  new DashboardService();
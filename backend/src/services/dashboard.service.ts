import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
  private readonly repository: DashboardRepository;

  constructor() {
    this.repository = new DashboardRepository();
  }

  async getStatistics() {
    return this.repository.getStatistics();
  }
}
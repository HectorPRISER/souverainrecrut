export interface DashboardStats {
  users: number;
  candidates: number;
  jobs: number;
  applications: number;
}

export interface DashboardResponse {
  success: boolean;

  data: DashboardStats;
}
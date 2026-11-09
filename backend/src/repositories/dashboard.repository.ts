import { ApplicationStatus } from "@prisma/client";

import { prisma } from "../config/prisma";

export class DashboardRepository {
  async getStatistics() {
    const [
      users,
      candidates,
      jobs,
      applications,
      pendingApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.candidate.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.application.count({
        where: {
          status: ApplicationStatus.PENDING,
        },
      }),
    ]);

    return {
      users,
      candidates,
      jobs,
      applications,
      pendingApplications,
    };
  }
}
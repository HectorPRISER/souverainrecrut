import { useEffect, useState } from "react";

import PageHeader from "../../components/layout/PageHeader";

import { dashboardService } from "../../services/dashboard.service";

import type {
  DashboardStats,
} from "../../types/dashboard.types";

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response =
          await dashboardService.getStats();

        setStats(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: "Utilisateurs",
      value: stats?.users,
    },
    {
      title: "Candidats",
      value: stats?.candidates,
    },
    {
      title: "Offres",
      value: stats?.jobs,
    },
    {
      title: "Candidatures",
      value: stats?.applications,
    },
  ];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Bienvenue sur SouverainRecrut."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: 10,
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3>{card.title}</h3>

            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              {loading
                ? "..."
                : card.value ?? 0}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
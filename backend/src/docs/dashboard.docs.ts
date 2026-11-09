export const dashboardDocs = {
  paths: {
    "/dashboard/stats": {
      get: {
        tags: ["Dashboard"],

        summary: "Statistiques du tableau de bord",

        description:
          "Retourne les principales statistiques de l'application.",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Statistiques récupérées avec succès.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: {
                    users: 5,
                    candidates: 18,
                    jobs: 7,
                    applications: 24,
                    pendingApplications: 9,
                  },
                },
              },
            },
          },

          401: {
            description: "Authentification requise.",
          },
        },
      },
    },
  },
};
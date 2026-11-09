export const healthDocs = {
  paths: {
    "/health": {
      get: {
        tags: ["Health"],

        summary: "Vérifier l'état de l'API",

        description:
          "Retourne l'état général de l'API (Liveness Probe).",

        responses: {
          200: {
            description: "API opérationnelle.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: {
                    status: "UP",
                    timestamp: "2026-07-01T22:00:00.000Z",
                    uptime: 245.37,
                    environment: "development",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/ready": {
      get: {
        tags: ["Health"],

        summary: "Vérifier que l'API est prête",

        description:
          "Vérifie la connexion à la base de données et indique si l'application est prête à recevoir du trafic (Readiness Probe).",

        responses: {
          200: {
            description: "Application prête.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: {
                    status: "READY",
                    database: "CONNECTED",
                    timestamp: "2026-07-01T22:00:00.000Z",
                  },
                },
              },
            },
          },

          503: {
            description: "Application non prête.",

            content: {
              "application/json": {
                example: {
                  success: false,

                  data: {
                    status: "NOT_READY",
                    database: "DISCONNECTED",
                    timestamp: "2026-07-01T22:00:00.000Z",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
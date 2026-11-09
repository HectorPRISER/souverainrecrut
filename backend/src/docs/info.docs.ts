export const infoDocs = {
  paths: {
    "/info": {
      get: {
        tags: ["Information"],

        summary: "Informations générales de l'API",

        description:
          "Retourne les métadonnées de l'API (version, environnement, documentation, endpoints de supervision...).",

        responses: {
          200: {
            description: "Informations de l'API récupérées avec succès.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: {
                    name: "SouverainRecrut API",
                    version: "1.0.0",
                    environment: "development",
                    apiVersion: "v1",
                    documentation: "/api-docs",
                    health: "/v1/health",
                    readiness: "/v1/ready",
                    node: "v22.17.0",
                    timestamp: "2026-07-01T22:30:00.000Z",
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
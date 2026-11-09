export const applicationDocs = {
  paths: {
    "/applications": {
      get: {
        tags: ["Applications"],
        summary: "Lister les candidatures",
        description:
          "Retourne la liste paginée des candidatures.",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              default: 1,
            },
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 10,
            },
          },
        ],

        responses: {
          200: {
            description: "Liste des candidatures.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: [
                    {
                      id: "cmr0rce8c0005yws40qkwhdwa",
                      candidateId: "cmr0rce880001yws4aobnd3rl",
                      jobId: "cmr0rce8a0003yws4haulp35i",
                      status: "PENDING",

                      candidate: {
                        id: "cmr0rce880001yws4aobnd3rl",
                        fullName: "Mamadou Bah",
                        email: "mamadou@example.com",
                      },

                      job: {
                        id: "cmr0rce8a0003yws4haulp35i",
                        title: "Développeur Full Stack",
                        company: "SouverainTech",
                      },
                    },
                  ],

                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
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

      post: {
        tags: ["Applications"],

        summary: "Créer une candidature",

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                properties: {
                  candidateId: {
                    type: "string",
                    example: "cmr0rce880001yws4aobnd3rl",
                  },

                  jobId: {
                    type: "string",
                    example: "cmr0rce8a0003yws4haulp35i",
                  },

                  status: {
                    type: "string",
                    enum: [
                      "PENDING",
                      "REVIEW",
                      "ACCEPTED",
                      "REJECTED",
                    ],
                    example: "PENDING",
                  },
                },

                required: [
                  "candidateId",
                  "jobId",
                ],
              },
            },
          },
        },

        responses: {
          201: {
            description: "Candidature créée.",
          },

          400: {
            description: "Erreur de validation.",
          },
        },
      },
    },

    "/applications/{id}": {
      get: {
        tags: ["Applications"],

        summary: "Obtenir une candidature",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,

            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description: "Candidature trouvée.",
          },

          404: {
            description: "Candidature introuvable.",
          },
        },
      },

      put: {
        tags: ["Applications"],

        summary: "Modifier une candidature",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,

            schema: {
              type: "string",
            },
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                properties: {
                  status: {
                    type: "string",
                    enum: [
                      "PENDING",
                      "REVIEW",
                      "ACCEPTED",
                      "REJECTED",
                    ],
                    example: "REVIEW",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Candidature mise à jour.",
          },

          404: {
            description: "Candidature introuvable.",
          },
        },
      },

      delete: {
        tags: ["Applications"],

        summary: "Supprimer une candidature",

        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,

            schema: {
              type: "string",
            },
          },
        ],

        responses: {
          200: {
            description: "Candidature supprimée.",
          },

          404: {
            description: "Candidature introuvable.",
          },
        },
      },
    },
  },
};
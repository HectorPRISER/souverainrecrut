export const candidateDocs = {
  paths: {
    "/candidates": {
      get: {
        tags: ["Candidates"],
        summary: "Lister les candidats",
        description:
          "Retourne la liste paginée des candidats.",

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
            description: "Liste des candidats.",

            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    {
                      id: "cmr0rce880001yws4aobnd3rl",
                      fullName: "Mamadou Bah",
                      email: "mamadou@example.com",
                      phone: "+224620000001",
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
        tags: ["Candidates"],

        summary: "Créer un candidat",

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
                  fullName: {
                    type: "string",
                    example: "Jean Dupont",
                  },

                  email: {
                    type: "string",
                    example: "jean@example.com",
                  },

                  phone: {
                    type: "string",
                    example: "+33123456789",
                  },
                },

                required: [
                  "fullName",
                  "email",
                  "phone",
                ],
              },
            },
          },
        },

        responses: {
          201: {
            description: "Candidat créé.",
          },

          400: {
            description: "Erreur de validation.",
          },

          409: {
            description: "Email déjà utilisé.",
          },
        },
      },
    },

    "/candidates/{id}": {
      get: {
        tags: ["Candidates"],

        summary: "Obtenir un candidat",

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
            description: "Candidat trouvé.",
          },

          404: {
            description: "Candidat introuvable.",
          },
        },
      },

      put: {
        tags: ["Candidates"],

        summary: "Modifier un candidat",

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
                  fullName: {
                    type: "string",
                  },

                  email: {
                    type: "string",
                  },

                  phone: {
                    type: "string",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Candidat mis à jour.",
          },

          404: {
            description: "Candidat introuvable.",
          },
        },
      },

      delete: {
        tags: ["Candidates"],

        summary: "Supprimer un candidat",

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
            description: "Candidat supprimé.",
          },

          404: {
            description: "Candidat introuvable.",
          },
        },
      },
    },
  },
};
export const userDocs = {
  paths: {
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Lister les utilisateurs",
        description:
          "Retourne la liste paginée des utilisateurs.",

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
            description: "Liste des utilisateurs.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: [
                    {
                      id: "cmr0rce840000yws4oao08la7",
                      firstName: "Alice",
                      lastName: "Diallo",
                      email: "alice@souverainrecrut.com",
                      role: "RECRUITER",
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
        tags: ["Users"],

        summary: "Créer un utilisateur",

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
                  firstName: {
                    type: "string",
                    example: "Alice",
                  },

                  lastName: {
                    type: "string",
                    example: "Diallo",
                  },

                  email: {
                    type: "string",
                    example: "alice@souverainrecrut.com",
                  },

                  password: {
                    type: "string",
                    example: "password123",
                  },

                  role: {
                    type: "string",
                    enum: [
                      "ADMIN",
                      "RECRUITER",
                    ],
                    example: "RECRUITER",
                  },
                },

                required: [
                  "firstName",
                  "lastName",
                  "email",
                  "password",
                  "role",
                ],
              },
            },
          },
        },

        responses: {
          201: {
            description: "Utilisateur créé.",
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

    "/users/{id}": {
      get: {
        tags: ["Users"],

        summary: "Obtenir un utilisateur",

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
            description: "Utilisateur trouvé.",
          },

          404: {
            description: "Utilisateur introuvable.",
          },
        },
      },

      put: {
        tags: ["Users"],

        summary: "Modifier un utilisateur",

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
                  firstName: {
                    type: "string",
                  },

                  lastName: {
                    type: "string",
                  },

                  email: {
                    type: "string",
                  },

                  password: {
                    type: "string",
                  },

                  role: {
                    type: "string",
                    enum: [
                      "ADMIN",
                      "RECRUITER",
                    ],
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Utilisateur mis à jour.",
          },

          404: {
            description: "Utilisateur introuvable.",
          },
        },
      },

      delete: {
        tags: ["Users"],

        summary: "Supprimer un utilisateur",

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
            description: "Utilisateur supprimé.",
          },

          404: {
            description: "Utilisateur introuvable.",
          },
        },
      },
    },
  },
};
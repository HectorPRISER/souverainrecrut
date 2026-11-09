export const jobDocs = {
  paths: {
    "/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "Lister les offres d'emploi",
        description:
          "Retourne la liste paginée des offres d'emploi.",

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
            description: "Liste des offres.",

            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    {
                      id: "cmr0rce8a0003yws4haulp35i",
                      title: "Développeur Full Stack",
                      description: "Node.js / React",
                      location: "Conakry",
                      company: "SouverainTech",
                      recruiterId: "cmr0rce840000yws4oao08la7",
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
        tags: ["Jobs"],

        summary: "Créer une offre d'emploi",

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
                  title: {
                    type: "string",
                    example: "Développeur Backend",
                  },

                  description: {
                    type: "string",
                    example:
                      "Développement d'API REST avec Node.js et Prisma.",
                  },

                  location: {
                    type: "string",
                    example: "Conakry",
                  },

                  company: {
                    type: "string",
                    example: "SouverainTech",
                  },

                  recruiterId: {
                    type: "string",
                    example: "cmr0rce840000yws4oao08la7",
                  },
                },

                required: [
                  "title",
                  "description",
                  "location",
                  "company",
                  "recruiterId",
                ],
              },
            },
          },
        },

        responses: {
          201: {
            description: "Offre créée.",
          },

          400: {
            description: "Erreur de validation.",
          },
        },
      },
    },

    "/jobs/{id}": {
      get: {
        tags: ["Jobs"],

        summary: "Obtenir une offre d'emploi",

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
            description: "Offre trouvée.",
          },

          404: {
            description: "Offre introuvable.",
          },
        },
      },

      put: {
        tags: ["Jobs"],

        summary: "Modifier une offre d'emploi",

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
                  title: {
                    type: "string",
                  },

                  description: {
                    type: "string",
                  },

                  location: {
                    type: "string",
                  },

                  company: {
                    type: "string",
                  },

                  recruiterId: {
                    type: "string",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Offre mise à jour.",
          },

          404: {
            description: "Offre introuvable.",
          },
        },
      },

      delete: {
        tags: ["Jobs"],

        summary: "Supprimer une offre d'emploi",

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
            description: "Offre supprimée.",
          },

          404: {
            description: "Offre introuvable.",
          },
        },
      },
    },
  },
};
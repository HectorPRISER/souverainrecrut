export const authDocs = {
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authentifier un utilisateur",
        description:
          "Permet à un utilisateur de se connecter et de récupérer un token JWT.",

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                type: "object",

                properties: {
                  email: {
                    type: "string",
                    example: "alice@souverainrecrut.com",
                  },

                  password: {
                    type: "string",
                    example: "password123",
                  },
                },

                required: ["email", "password"],
              },
            },
          },
        },

        responses: {
          200: {
            description: "Connexion réussie.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: {
                    user: {
                      id: "cmr0rce840000yws4oao08la7",
                      firstName: "Alice",
                      lastName: "Diallo",
                      email: "alice@souverainrecrut.com",
                      role: "RECRUITER",
                    },

                    token:
                      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                },
              },
            },
          },

          401: {
            description: "Email ou mot de passe invalide.",
          },
        },
      },
    },

    "/auth/me": {
      get: {
        tags: ["Authentication"],

        summary: "Profil de l'utilisateur connecté",

        description:
          "Retourne les informations de l'utilisateur authentifié.",

        security: [
          {
            bearerAuth: [],
          },
        ],

        responses: {
          200: {
            description: "Profil utilisateur.",

            content: {
              "application/json": {
                example: {
                  success: true,

                  data: {
                    id: "cmr0rce840000yws4oao08la7",
                    firstName: "Alice",
                    lastName: "Diallo",
                    email: "alice@souverainrecrut.com",
                    role: "RECRUITER",
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
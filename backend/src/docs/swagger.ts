import swaggerJsdoc from "swagger-jsdoc";

import { authDocs } from "./auth.docs";
import { candidateDocs } from "./candidate.docs";
import { jobDocs } from "./job.docs";
import { applicationDocs } from "./application.docs";
import { userDocs } from "./user.docs";
import { dashboardDocs } from "./dashboard.docs";
import { infoDocs } from "./info.docs";
import { healthDocs } from "./health.docs";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "SouverainRecrut API",
      version: "1.0.0",
      description:
        "API REST de la plateforme SouverainRecrut développée avec Express, TypeScript, Prisma et PostgreSQL.",

      contact: {
        name: "SouverainRecrut",
        email: "contact@souverainrecrut.com",
      },
    },

    servers: [
      {
        url: "http://localhost:4500/v1",
        description: "Serveur de développement",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "Authentification des utilisateurs",
      },
      {
        name: "Users",
        description: "Gestion des utilisateurs",
      },
      {
        name: "Candidates",
        description: "Gestion des candidats",
      },
      {
        name: "Jobs",
        description: "Gestion des offres d'emploi",
      },
      {
        name: "Applications",
        description: "Gestion des candidatures",
      },
      {
        name: "Dashboard",
        description: "Statistiques de l'application",
      },
      {
        name: "Information",
        description: "Informations générales sur l'API",
      },
      {
        name: "Health",
        description: "Surveillance et état de l'API",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],

    paths: {
      ...authDocs.paths,
      ...userDocs.paths,
      ...candidateDocs.paths,
      ...jobDocs.paths,
      ...applicationDocs.paths,
      ...dashboardDocs.paths,
      ...infoDocs.paths,
      ...healthDocs.paths,
    },
  },

  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
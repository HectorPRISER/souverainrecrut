# Architecture du projet

L'application est composée de deux couches.

```
Utilisateur

↓

Frontend React

↓

API REST Express

↓

Prisma ORM

↓

PostgreSQL
```

Chaque composant possède une responsabilité unique.

Le frontend est chargé de l'interface utilisateur.

Le backend expose une API REST sécurisée.

La base PostgreSQL stocke les données de l'application.
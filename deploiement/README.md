# SouverainRecrut — CI/CD Jour 2 : provisionnement et déploiement

Périmètre **Backend uniquement**. Ce README est complété étape par étape.

Chaîne cible :

```
VM Ubuntu (QEMU/KVM) → Terraform → Ansible → GitLab CI/CD → pull image Docker Hub → Docker Compose + PostgreSQL
```

| Étape | Contenu | État |
|-------|---------|------|
| 1 | Docker Compose + migrations Prisma (`deployment/`) | Fait et testé en local |
| 2 | Terraform (`terraform/`) | À faire |
| 3 | Ansible (`ansible/`) | À faire |
| 4 | Pipeline GitLab (`.gitlab-ci.yml`), staging auto + production manuelle | À faire |
| 5 | Rollback et vérifications | À faire |
| 6 | Documentation finale (`../documentation/`) | À faire |

---

## Étape 1 — Docker Compose et migrations Prisma

Fichiers : `deployment/docker-compose.yml`, `deployment/.env.example`.

### Services

| Service | Rôle |
|---------|------|
| `postgres` | PostgreSQL 16, volume persistant `pgdata`, healthcheck `pg_isready` |
| `schema-sync` | Copie `prisma/` (schéma + migrations) **depuis l'image backend déployée** vers un volume partagé |
| `migrate` | Image `node:22.16.0-alpine3.22` + CLI Prisma épinglée, exécute `prisma migrate deploy` (jamais de reset) |
| `init-admin` | Crée un compte ADMIN depuis `ADMIN_EMAIL` / `ADMIN_PASSWORD` s'il n'existe pas (idempotent, aucun seed destructif) |
| `api` | Image backend de Docker Hub, port `API_PORT`, healthcheck sur `/v1/ready`, `restart: unless-stopped` |

Ordre garanti par `depends_on` : `postgres` sain → `schema-sync` → `migrate` → `api` (et `init-admin`).

### Choix techniques

- **Migrations** : l'image backend n'embarque pas la CLI Prisma. Plutôt que de la republier, le schéma est extrait de l'image
  déployée : la migration est donc toujours alignée sur la version du code. Limite : `npx` télécharge la CLI Prisma, la VM doit
  avoir accès à Internet.
- **Rollback et schéma** : un retour à une image précédente ne défait pas les migrations déjà appliquées. À traiter à l'étape 5
  (migrations rétro-compatibles).
- **Environnements multiples** : `COMPOSE_PROJECT_NAME` et `API_PORT` différents permettent staging et production sur la même VM,
  avec volumes, réseaux et conteneurs distincts.
- **Image** : tag immuable `version-sha-commit` produit par Jenkins, jamais `latest`.
- **Secrets** : aucun dans le dépôt. `.env` est ignoré par git ; en pipeline les valeurs viennent des variables GitLab masquées.

### Utilisation

```bash
cd deploiement/deployment
cp .env.example .env        # renseigner BACKEND_IMAGE, mots de passe, JWT_SECRET, ADMIN_*
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f api
```

Vérification :

```bash
curl http://localhost:4000/v1/ready          # {"success":true, ... "database":"CONNECTED"}
curl -X POST http://localhost:4000/v1/auth/login -H 'content-type: application/json' \
     -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'
```

### Résultats du test local (image du Jour 1, `souverainrecrut-backend:local`)

- Postgres `healthy`, migration `20260630124434_init` appliquée, API `healthy`.
- `/v1/ready` : `CONNECTED` ; login de l'admin créé par `init-admin` : OK ; `/v1/dashboard/stats` : OK.
- `down` puis `up` (sans `-v`) : données conservées, « No pending migrations to apply », admin non dupliqué.
- Bug corrigé pendant le test : Compose interprétait `$disconnect` du script JS comme une variable (échappé en `$$disconnect`).

### Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `variable is not set` au `up` | `.env` incomplet | Compléter `.env` d'après `.env.example` |
| `migrate` en échec | Pas d'accès Internet pour `npx` ou base non prête | `docker compose logs migrate` ; vérifier le réseau de la VM |
| Port déjà utilisé | Autre environnement sur le même `API_PORT` | Changer `API_PORT` |
| `api` reste `unhealthy` | Base inaccessible ou `JWT_SECRET` absent | `docker compose logs api` |

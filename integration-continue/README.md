# SouverainRecrut — CI/CD Jour 1 : intégration continue (rapport + tutoriel)

Module CI/CD · Mastère Dev M2 · Sup de Vinci Rennes · périmètre **Backend uniquement**.

Chaîne réalisée (Jour 1) :

```
GitHub (branche Dev) → Jenkins → build + tests (PostgreSQL réel) → SonarQube / Quality Gate
                     → build image Docker → scan Trivy → push Docker Hub
```

Le Jour 2 (Terraform, Ansible, GitLab CI, Docker Compose, rollback) n'est **pas** traité ici.

---

## 1. Ce qui a été fait

| # | Livrable | Fichier(s) |
|---|----------|-----------|
| 1 | Environnement de tests : Jest + ts-jest + supertest, PostgreSQL réel, couverture lcov/cobertura, rapport JUnit | `backend/jest.config.js`, `backend/tsconfig.test.json`, `backend/tests/` |
| 2 | 56 tests (8 suites) : auth, utilisateurs, candidats, offres, candidatures, contrôle d'accès (401/403), santé, dashboard, unitaires | `backend/tests/**` |
| 3 | Analyse SonarQube + Quality Gate personnalisé | `sonar/sonar-project.properties`, `sonar/setup-quality-gate.sh` |
| 4 | Jenkins as code (JCasC) + SonarQube en Docker Compose | `jenkins/` |
| 5 | `Jenkinsfile` déclaratif (10 stages) | `Jenkinsfile` |
| 6 | Dockerfile durci (multi-stage, non-root, healthcheck, tags figés) + `.dockerignore` | `Dockerfile`, `backend/.dockerignore` |
| 7 | Scan Trivy (seuil CRITICAL bloquant) et audit npm | stage `Scan Trivy`, `Audit dépendances` |
| 8 | Publication Docker Hub avec tags traçables | stage `Push Docker Hub` |
| 9 | Rapports réels du dernier build | `reports/` |

### Résultats mesurés (build Jenkins #3, SUCCESS)

| Contrôle | Résultat |
|----------|----------|
| Tests | 56 / 56 passés |
| Couverture (statements / branches / functions / lines) | 100 % / 100 % / 100 % / 100 % |
| SonarQube Quality Gate | **PASSED** (0 bug, 0 vulnérabilité, 0 hotspot, 0,0 % duplication, 15 code smells mineurs) |
| Trivy, couche OS | 0 HIGH / 0 CRITICAL |
| Trivy, dépendances | 0 CRITICAL, 1 HIGH non bloquant (`deepmerge-ts`, dépendance transitive de Prisma, correctif non compatible) |
| Image | `hectorpriser/souverainrecrut-backend:1.0.0-sha-<commit>` + `:1.0.0` |

Limite honnête : le push Docker Hub a été validé jusqu'au `docker login` (stage correctement sauté avec
`PUSH_IMAGE=false` lors de la validation locale, faute de token Docker Hub réel). Il s'exécutera avec vos credentials.

### Choix techniques et justifications

- **PostgreSQL réel pour les tests** : un conteneur éphémère `postgres:16-alpine` est lancé par le pipeline sur le réseau
  `ci-net` ; les migrations Prisma sont appliquées par `globalSetup`. Les tests couvrent ainsi repositories, services,
  contrôleurs et middlewares, pas seulement des mocks.
- **Exclusions de couverture** (`src/server.ts`, `src/docs/**`, `src/types/**`) : bootstrap `listen()` et définitions
  OpenAPI déclaratives, sans logique. Les mêmes exclusions sont déclarées dans Jest et Sonar. `src/docs/**` est aussi exclu
  de la détection de duplication (structures répétitives par nature : 20 % de duplication sinon).
- **Quality Gate « SouverainRecrut »** : couverture code neuf ≥ 80 %, couverture globale ≥ 90 %, 0 vulnérabilité et 0 bug
  sur code neuf, hotspots 100 % revus, duplications < 3 %. (Sur la toute première analyse, SonarQube n'évalue pas les
  conditions « code neuf » faute de référence : seules les conditions globales jouent.)
- **Quality Gate sans webhook** : `-Dsonar.qualitygate.wait=true` fait attendre le verdict au scanner, qui échoue si le
  gate est rouge. Évite d'exposer Jenkins pour un webhook SonarQube.
- **Trivy** : rapport complet HIGH+CRITICAL archivé (non bloquant), puis seuil **CRITICAL bloquant** (`--exit-code 1`),
  avec `--ignore-unfixed` pour ne pas bloquer sur des CVE sans correctif.
  Preuve que le gate fonctionne : le premier scan a trouvé `proxy-addr` (CRITICAL) et 16 HIGH dans les dépendances npm ;
  corrigés par `npm audit fix` (lockfile) avant le build final. Le CVE `node-tar` venait de npm embarqué dans l'image :
  npm/yarn sont retirés de l'image finale (inutiles à l'exécution).
- **Dockerfile** (déplacé de `backend/` vers `integration-continue/`, contexte de build `backend/`) : base `node:22.16.0-alpine3.22`
  (Node 22 comme exigé, ancienne image en node:20), multi-stage (build / deps prod / runtime), utilisateur `node` non-root,
  `HEALTHCHECK` sur `/v1/health`, dépendances copiées avant le code (cache), `.dockerignore` (pas de `.env`, tests, `.git`).
  Port 4000 (`PORT=4000`).
- **Tags** : `1.0.0-sha-<7 car. du commit>` (immuable, celui à déployer au Jour 2) et `1.0.0` (version `package.json`). Jamais `latest`.
- **Déclenchement** : `pollSCM` toutes les ~5 min (Jenkins local, pas de webhook GitHub possible).
  Push restreint à la branche `Dev`.
- **Secrets** : aucun dans le dépôt. Docker Hub et token Sonar sont injectés par JCasC depuis un fichier `.env` non
  versionné, puis consommés via `withCredentials` / `withSonarQubeEnv` (masqués dans les logs).
- **Modifications du code applicatif** (minimales) : `app.disable("x-powered-by")` dans `backend/src/app.ts`
  (hotspot Sonar S5689, avec test) ; `npm audit fix` sur les dépendances. Les 15 code smells mineurs (dépréciations Zod,
  `||` vs `??`) sont examinés et laissés en l'état pour ne pas changer le comportement.

### Stages du Jenkinsfile

`Checkout` → `Install` (npm ci) → `Prisma generate` → `Build TypeScript` → `Tests + couverture` (JUnit + lcov archivés)
→ `Audit dépendances` (npm audit, CRITICAL bloquant) → `SonarQube + Quality Gate` → `Build image Docker` → `Scan Trivy`
→ `Push Docker Hub` (si `PUSH_IMAGE` et branche `Dev`). Le bloc `post` supprime la base de test, fait `docker logout`
et nettoie les images locales.

---

## 2. Tutoriel : tout lancer

### Prérequis

- Docker + Docker Compose, ~10 Go de disque libres (SonarQube/Elasticsearch refuse de démarrer si le disque dépasse 95 %).
- Node.js 22+ (`nvm use 22`) pour les tests en local.
- Comptes GitHub et Docker Hub (access token en lecture/écriture : Account settings → Personal access tokens).
- Un fork du dépôt avec la branche `Dev` poussée (Jenkins clone depuis GitHub).

### A. Lancer les tests en local (sans Jenkins)

```bash
cd backend
npm ci && npx prisma generate

# PostgreSQL de test
docker run -d --name sr-pg-test -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=souverainrecrut_test -p 5433:5432 postgres:16-alpine

npm run test:coverage     # DATABASE_URL par défaut : localhost:5433 (voir tests/setup/env.ts)
# Rapports : backend/coverage/lcov-report/index.html, backend/reports/junit.xml
```

### B. Construire et vérifier l'image

```bash
docker build -f integration-continue/Dockerfile -t souverainrecrut-backend:local backend
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.58.1 \
  image --ignore-unfixed --severity HIGH,CRITICAL souverainrecrut-backend:local
```

### C. Lancer la chaîne CI complète (Jenkins + SonarQube)

```bash
cd integration-continue/jenkins
cp .env.example .env           # renseigner DOCKERHUB_USER, DOCKERHUB_TOKEN, mot de passe Jenkins, GIT_REPO_URL (votre fork)

# 1. SonarQube d'abord
docker compose up -d sonarqube
#    attendre "UP" : curl -s localhost:9000/api/system/status

# 2. Token Sonar (admin/admin au premier démarrage : changez le mot de passe dans l'UI http://localhost:9000)
curl -u admin:<mot-de-passe> -X POST localhost:9000/api/user_tokens/generate -d name=jenkins
#    copier le champ "token" dans .env (SONAR_TOKEN=...)

# 3. Quality Gate « SouverainRecrut »
SONAR_TOKEN=<token> ../sonar/setup-quality-gate.sh

# 4. Jenkins (build de l'image + configuration automatique JCasC, job « souverainrecrut-backend » créé)
docker compose up -d --build jenkins
```

Puis : <http://localhost:8080> (utilisateur `admin`, mot de passe `JENKINS_ADMIN_PASSWORD`) →
job **souverainrecrut-backend** → *Build with Parameters* (`DOCKERHUB_NAMESPACE` = votre compte Docker Hub ;
décocher `PUSH_IMAGE` pour un essai à blanc).
Le premier lancement peut afficher les paramètres seulement après un premier run. Ensuite `pollSCM` relance
le pipeline à chaque commit sur `Dev`.

Résultats : console Jenkins (stages verts), SonarQube <http://localhost:9000/dashboard?id=souverainrecrut-backend>,
artefacts du build (couverture, JUnit, Trivy), image sur `https://hub.docker.com/r/<compte>/souverainrecrut-backend`.

### D. Arrêter / nettoyer

```bash
docker compose down        # conserve les volumes ; ajouter -v pour tout effacer
docker rm -f sr-pg-test
```

---

## 3. Dépannage (runbook)

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| SonarQube reste `STARTING` / indices en lecture seule | Disque > 95 % | Libérer du disque (`docker builder prune`) puis `docker restart sonarqube` |
| Stage Tests : `pg_isready` échoue | Réseau `ci-net` absent | Démarrer la stack compose (elle crée `ci-net`) |
| Stage Sonar : `QUALITY GATE STATUS: FAILED` | Couverture/duplication/vuln sous le seuil | Ouvrir le lien du dashboard, corriger, relancer |
| Stage Trivy en échec | CVE CRITICAL corrigeable | Voir `reports/trivy-report.txt`, mettre à jour la dépendance (`npm audit fix`) ou l'image de base |
| Push : `unauthorized` | Token Docker Hub invalide/insuffisant | Régénérer le token (Read & Write), mettre à jour `.env`, recréer le conteneur Jenkins |
| `Checkout ... references a local directory` | URL `file://` | Utiliser l'URL GitHub du fork |

---

## 4. Contenu du dossier

```
integration-continue/
├── Jenkinsfile                  pipeline as code
├── Dockerfile                   image backend (contexte : backend/)
├── sonar/
│   ├── sonar-project.properties
│   └── setup-quality-gate.sh    crée le Quality Gate (idempotent)
├── jenkins/
│   ├── Dockerfile  plugins.txt  casc.yaml  docker-compose.yml  .env.example
└── reports/                     junit.xml, coverage-summary, sonar-summary, trivy-report, npm-audit, console Jenkins
```

Captures d'écran demandées par le cahier des charges : à ajouter dans `reports/` (dashboard Sonar, vue des stages Jenkins,
dépôt Docker Hub).

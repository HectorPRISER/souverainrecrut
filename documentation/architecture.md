# Architecture — SouverainRecrut (backend)

## Vue d'ensemble

Un commit sur la branche `Dev` est testé, analysé, empaqueté et publié par Jenkins, puis déployé par GitLab CI/CD :
staging automatiquement, production après approbation manuelle.

```
INTÉGRATION CONTINUE (Jenkins, machine de travail)
GitHub (Dev) -> Jenkins -> Tests (Jest + PostgreSQL) -> SonarQube (Quality Gate) -> Image Docker + Trivy -> Docker Hub
                                                                                                              |
DÉPLOIEMENT (GitLab CI/CD, runner local)                                                                      v
Docker Hub -> GitLab CI/CD -> VM sr-deploy (Ubuntu, QEMU/KVM) : Staging (port 4001, automatique)
                                                              Production (port 4000, approbation manuelle)

PROVISIONNEMENT
Terraform (inventaire) -> Ansible (Docker, Compose, dossiers, UFW) -> prépare la VM
```

Le schéma dessiné est dans le rapport final (Google Doc / Claude Doc), section « Architecture de la chaîne ».

## Rôle de chaque outil

| Outil | Rôle | Où |
|-------|------|----|
| GitHub | Dépôt du code ; branche `Dev` surveillée par Jenkins (interrogation toutes les ~5 min) | cloud |
| Jenkins | Orchestre build, tests, qualité, image, scans, publication (`integration-continue/Jenkinsfile`) | machine de travail (Docker) |
| SonarQube | Analyse statique, couverture, Quality Gate | machine de travail (Docker) |
| Trivy | Scan de l'image, CRITICAL bloquant | dans Jenkins |
| Docker Hub | Registre des images `hector29600/souverainrecrut-backend` | cloud |
| GitLab CI/CD | Pipeline de déploiement (`deploiement/.gitlab-ci.yml`), approbation manuelle avant la production | cloud + runner local |
| Terraform | Décrit la cible, génère l'inventaire Ansible (`deploiement/terraform/`) | machine de travail (Docker) |
| Ansible | Prépare le serveur (`deploiement/ansible/`) | machine de travail (Docker) |
| Docker Compose | PostgreSQL, migrations Prisma, API (`deploiement/deployment/`) | VM |

## Flux d'un changement, du code à l'API

1. Commit poussé sur `Dev` (GitHub).
2. Jenkins détecte le commit : installation, `prisma generate`, build TypeScript.
3. Tests contre un PostgreSQL éphémère ; couverture et rapport JUnit archivés.
4. `npm audit` (CRITICAL bloquant), puis analyse SonarQube : le build échoue si le Quality Gate est rouge.
5. Construction de l'image (`Dockerfile` multi-stage, utilisateur non-root), scan Trivy (CRITICAL bloquant).
6. Publication sur Docker Hub : tag immuable `X.Y.Z-sha-<commit>` et alias `X.Y.Z`.
7. Pipeline GitLab lancé avec `IMAGE_TAG` : validation du tag (existe sur Docker Hub, pas `latest`) et du fichier Compose.
8. Déploiement en staging (SSH, copie de `docker-compose.yml`, génération du `.env`, `docker compose pull` et `up -d`), puis vérification.
9. Approbation manuelle, déploiement en production, vérification.

## Sur la VM

Deux projets Compose indépendants (volumes, réseaux et conteneurs distincts) :

| Environnement | Dossier | Projet Compose | Port | Déclenchement |
|---------------|---------|----------------|------|---------------|
| Staging | `/opt/souverainrecrut/staging` | `souverainrecrut-staging` | 4001 | automatique |
| Production | `/opt/souverainrecrut/production` | `souverainrecrut-production` | 4000 | approbation manuelle |

Services d'un environnement : `postgres` (volume `pgdata`), `schema-sync` et `migrate` (migrations Prisma extraites de l'image déployée), `init-admin`, `api`.

## Choix d'architecture et justifications

- **Image jamais reconstruite au déploiement** : on déploie l'artefact testé et scanné par Jenkins.
- **Tag immuable `version-sha-commit`** : traçabilité et rollback précis.
- **Migrations extraites de l'image déployée** : le schéma appliqué correspond toujours au code déployé, sans republier d'image avec la CLI Prisma.
- **Runner GitLab local** : la VM a une adresse privée, qu'un runner partagé du cloud ne joint pas.
- **Terraform limité à l'inventaire** : le provider vSphere exige ESXi et vCenter, absents ; la variante vSphere est documentée.
- **Deux environnements sur une seule VM** : simplicité du TP ; limite signalée dans le rapport.

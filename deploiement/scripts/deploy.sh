#!/bin/sh
# Déploie l'image backend sur le serveur : transmet docker-compose.yml et le .env généré, tire l'image, démarre les services.
# L'image est TIRÉE depuis Docker Hub : elle n'est jamais reconstruite depuis le code source.
#
# Variables (GitLab CI/CD) :
#   environnement : ENV_NAME, COMPOSE_PROJECT_NAME, API_PORT, IMAGE_TAG, DOCKERHUB_NAMESPACE
#   serveur       : SERVER_HOST, SSH_USER, SSH_PRIVATE_KEY (File), [SSH_PORT], [SSH_KNOWN_HOSTS], [DEPLOY_DIR]
#   secrets       : POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, JWT_SECRET, [ADMIN_EMAIL], [ADMIN_PASSWORD], [FRONTEND_URL]
#   Docker Hub    : [DOCKERHUB_USER], [DOCKERHUB_TOKEN] (nécessaires seulement si le dépôt d'images est privé)
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$HERE/common.sh"

require_vars COMPOSE_PROJECT_NAME API_PORT IMAGE_TAG DOCKERHUB_NAMESPACE \
             POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB JWT_SECRET
setup_ssh

IMAGE_REPO="${IMAGE_REPO:-souverainrecrut-backend}"
BACKEND_IMAGE="$DOCKERHUB_NAMESPACE/$IMAGE_REPO:$IMAGE_TAG"
COMPOSE_FILE="$HERE/../deployment/docker-compose.yml"

echo "Déploiement de $BACKEND_IMAGE sur $SERVER_HOST ($ENV_NAME, port $API_PORT)"

# 1) .env généré dans un fichier temporaire protégé : jamais affiché, jamais versionné
umask 077
ENV_FILE="$(mktemp)"
trap 'rm -f "$ENV_FILE"' EXIT
{
  echo "COMPOSE_PROJECT_NAME=$COMPOSE_PROJECT_NAME"
  echo "API_PORT=$API_PORT"
  echo "BACKEND_IMAGE=$BACKEND_IMAGE"
  echo "POSTGRES_USER=$POSTGRES_USER"
  echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
  echo "POSTGRES_DB=$POSTGRES_DB"
  echo "JWT_SECRET=$JWT_SECRET"
  echo "FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}"
  echo "ADMIN_EMAIL=${ADMIN_EMAIL:-}"
  echo "ADMIN_PASSWORD=${ADMIN_PASSWORD:-}"
  echo "PRISMA_VERSION=${PRISMA_VERSION:-6.19.3}"
} > "$ENV_FILE"

# 2) Répertoire cible (créé par Ansible) et sauvegarde de la configuration précédente (base du rollback)
remote "mkdir -p '$REMOTE_DIR' && cd '$REMOTE_DIR' && { [ ! -f .env ] || cp -p .env .env.previous; }"

# 3) Transmission des fichiers de déploiement
# shellcheck disable=SC2086
scp $SCP_OPTS "$COMPOSE_FILE" "$SSH_USER@$SERVER_HOST:$REMOTE_DIR/docker-compose.yml"
# shellcheck disable=SC2086
scp $SCP_OPTS "$ENV_FILE" "$SSH_USER@$SERVER_HOST:$REMOTE_DIR/.env"
remote "chmod 600 '$REMOTE_DIR/.env'"

# 4) Connexion à Docker Hub seulement si un token est fourni (dépôt privé), mot de passe lu sur stdin
if [ -n "${DOCKERHUB_TOKEN:-}" ] && [ -n "${DOCKERHUB_USER:-}" ]; then
  printf '%s' "$DOCKERHUB_TOKEN" | remote "docker login -u '$DOCKERHUB_USER' --password-stdin" >/dev/null
  echo "Connecté à Docker Hub."
fi

# 5) Récupération de l'image et démarrage (migrations Prisma exécutées avant l'API par Compose)
remote "cd '$REMOTE_DIR' && docker compose pull && docker compose up -d --remove-orphans"
remote "cd '$REMOTE_DIR' && docker compose ps"

echo "Déploiement terminé : $BACKEND_IMAGE"

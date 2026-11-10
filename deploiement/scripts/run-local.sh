#!/usr/bin/env bash
# Lance deploy.sh / verify.sh depuis ta machine, dans un conteneur alpine jetable (comme le ferait le runner GitLab),
# SANS passer par GitLab. Sert à tester les scripts de déploiement contre la vraie VM.
#
#   ./run-local.sh deploy [staging|production]
#   ./run-local.sh verify [staging|production]
#
# Les variables viennent de scripts/local.<env>.env (créé au premier lancement, secrets aléatoires,
# droits 600, ignoré par git). Ce fichier joue le rôle des variables CI/CD GitLab.
# Le conteneur ne touche PAS à ton ~/.ssh : known_hosts et clé sont gérés dans le conteneur.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
ACTION="${1:?usage: $0 deploy|verify [staging|production]}"
ENV_NAME="${2:-staging}"
KEY="${SSH_KEY_PATH:-$HOME/.ssh/sr_deploy}"
CONF="$HERE/local.$ENV_NAME.env"

case "$ACTION" in deploy|verify) ;; *) echo "action inconnue : $ACTION" >&2; exit 1 ;; esac
case "$ENV_NAME" in
  staging)    PROJECT=souverainrecrut-staging;    PORT=4001 ;;
  production) PROJECT=souverainrecrut-production; PORT=4000 ;;
  *) echo "environnement inconnu : $ENV_NAME" >&2; exit 1 ;;
esac
[[ -r "$KEY" ]] || { echo "Clé SSH introuvable : $KEY" >&2; exit 1; }

if [[ ! -f "$CONF" ]]; then
  umask 077
  cat > "$CONF" <<EOF
ENV_NAME=$ENV_NAME
COMPOSE_PROJECT_NAME=$PROJECT
API_PORT=$PORT
IMAGE_TAG=1.0.0-sha-aab7d05
DOCKERHUB_NAMESPACE=hector29600
SERVER_HOST=192.168.122.50
SSH_USER=deploy
POSTGRES_USER=souverain
POSTGRES_DB=souverainrecrut
POSTGRES_PASSWORD=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
ADMIN_EMAIL=admin@souverain.local
ADMIN_PASSWORD=$(openssl rand -hex 8)
EOF
  echo "Fichier de variables créé : $CONF (secrets aléatoires, ignoré par git). Relis-le avant de continuer si besoin."
fi

# Le serveur doit être joignable avant de lancer quoi que ce soit
# shellcheck disable=SC1090
SERVER_HOST="$(grep '^SERVER_HOST=' "$CONF" | cut -d= -f2)"
ping -c1 -W2 "$SERVER_HOST" >/dev/null 2>&1 || { echo "Serveur $SERVER_HOST injoignable (VM éteinte ?)." >&2; exit 1; }

docker run --rm --network host \
  -v "$ROOT":/repo:ro \
  -v "$KEY":/keys/key:ro \
  --env-file "$CONF" \
  -e SSH_PRIVATE_KEY=/tmp/key \
  -w /repo alpine:3.21 \
  sh -c "apk add --no-cache openssh-client curl >/dev/null && cp /keys/key /tmp/key && sh scripts/$ACTION.sh"

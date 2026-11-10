#!/bin/sh
# Vérifie un déploiement : conteneurs, migrations et disponibilité de l'API (avec attente).
# Variables : ENV_NAME, API_PORT, SERVER_HOST, SSH_USER, SSH_PRIVATE_KEY (File), [SSH_PORT], [SSH_KNOWN_HOSTS], [DEPLOY_DIR]
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=common.sh
. "$HERE/common.sh"

require_vars API_PORT
setup_ssh

echo "== Conteneurs ($ENV_NAME) =="
remote "cd '$REMOTE_DIR' && docker compose ps -a"

echo "== Services attendus =="
running="$(remote "cd '$REMOTE_DIR' && docker compose ps --status running --services")"
for svc in postgres api; do
  echo "$running" | grep -qx "$svc" || { echo "ERREUR : le service $svc ne tourne pas." >&2; exit 1; }
done
echo "postgres et api tournent."

echo "== Migrations Prisma =="
code="$(remote "cd '$REMOTE_DIR' && docker inspect -f '{{.State.ExitCode}}' \$(docker compose ps -aq migrate)")"
[ "$code" = "0" ] || { echo "ERREUR : le service migrate a terminé avec le code $code." >&2; exit 1; }
echo "migrate : code de sortie 0."

echo "== Disponibilité de l'API (jusqu'à 2 minutes) =="
i=0
until remote "curl -fsS http://127.0.0.1:$API_PORT/v1/ready" | grep -q '"database":"CONNECTED"'; do
  i=$((i + 1))
  if [ "$i" -ge 24 ]; then
    echo "ERREUR : l'API ne répond pas READY sur le port $API_PORT." >&2
    remote "cd '$REMOTE_DIR' && docker compose logs --tail 40 api" >&2 || true
    exit 1
  fi
  sleep 5
done
echo "API prête (/v1/ready : base CONNECTED)."

health="$(remote "curl -fsS http://127.0.0.1:$API_PORT/v1/health")"
echo "$health" | grep -q '"status":"UP"' || { echo "ERREUR : /v1/health inattendu." >&2; exit 1; }
echo "/v1/health : UP"

echo "== Image déployée =="
remote "cd '$REMOTE_DIR' && docker compose images api"

echo "Vérification réussie ($ENV_NAME)."

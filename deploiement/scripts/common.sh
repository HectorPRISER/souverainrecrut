#!/bin/sh
# Fonctions communes aux scripts de déploiement (POSIX sh : tourne sous busybox/alpine dans le runner).
# Variables attendues (fournies par GitLab CI/CD, jamais par le dépôt) :
#   SERVER_HOST, SSH_USER, SSH_PRIVATE_KEY (variable de type File = chemin du fichier)
# Optionnelles : SSH_PORT (22), SSH_KNOWN_HOSTS (File ou contenu), DEPLOY_DIR (/opt/souverainrecrut)

require_vars() {
  missing=""
  for v in "$@"; do
    eval "val=\${$v:-}"
    [ -n "$val" ] || missing="$missing $v"
  done
  if [ -n "$missing" ]; then
    echo "ERREUR : variables CI/CD manquantes :$missing" >&2
    exit 1
  fi
}

setup_ssh() {
  require_vars SERVER_HOST SSH_USER SSH_PRIVATE_KEY ENV_NAME
  SSH_PORT="${SSH_PORT:-22}"
  DEPLOY_DIR="${DEPLOY_DIR:-/opt/souverainrecrut}"
  REMOTE_DIR="$DEPLOY_DIR/$ENV_NAME"

  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
  chmod 600 "$SSH_PRIVATE_KEY"

  if [ -n "${SSH_KNOWN_HOSTS:-}" ]; then
    # Empreinte du serveur fournie : vérification stricte
    if [ -f "$SSH_KNOWN_HOSTS" ]; then cp "$SSH_KNOWN_HOSTS" "$HOME/.ssh/known_hosts"; else printf '%s\n' "$SSH_KNOWN_HOSTS" > "$HOME/.ssh/known_hosts"; fi
  else
    echo "AVERTISSEMENT : SSH_KNOWN_HOSTS non défini, empreinte récupérée au premier contact (TOFU)." >&2
    if ! ssh-keyscan -T 10 -p "$SSH_PORT" "$SERVER_HOST" > "$HOME/.ssh/known_hosts" 2> "$HOME/.ssh/keyscan.err" \
       || [ ! -s "$HOME/.ssh/known_hosts" ]; then
      echo "ERREUR : impossible de récupérer l'empreinte SSH de '$SERVER_HOST' (port $SSH_PORT)." >&2
      echo "         Vérifier SERVER_HOST (pas d'espace ni de http://), que la VM tourne, et que le runner la joint (network_mode host)." >&2
      cat "$HOME/.ssh/keyscan.err" >&2 || true
      exit 1
    fi
  fi
  chmod 644 "$HOME/.ssh/known_hosts"

  echo "Cible SSH : $SSH_USER@$SERVER_HOST:$SSH_PORT (dossier $REMOTE_DIR)"
  SSH_OPTS="-i $SSH_PRIVATE_KEY -p $SSH_PORT -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=15"
  SCP_OPTS="-i $SSH_PRIVATE_KEY -P $SSH_PORT -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=15"
  export SSH_PORT DEPLOY_DIR REMOTE_DIR SSH_OPTS SCP_OPTS
}

# remote <commande> : exécute une commande sur le serveur
# L'expansion côté client des arguments est voulue (SC2029)
# shellcheck disable=SC2029
remote() {
  # shellcheck disable=SC2086
  ssh $SSH_OPTS "$SSH_USER@$SERVER_HOST" "$@"
}

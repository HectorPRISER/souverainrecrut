#!/usr/bin/env bash
# Rejoue le playbook Ansible contre un conteneur Ubuntu simulé (aucune VM requise).
#   ./run-test.sh up       crée la cible + une clé SSH jetable
#   ./run-test.sh run      lance le playbook (appelable plusieurs fois : test d'idempotence)
#   ./run-test.sh verify   lance uniquement les vérifications
#   ./run-test.sh down     supprime cible, réseau, volumes et clé de test
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ANSIBLE_DIR="$(dirname "$HERE")"
NET=sr-ansible-test
TARGET=sr-target
KEYDIR="${TMPDIR:-/tmp}/sr-ansible-test-key"

ansible_run() {
  docker run --rm --network "$NET" \
    -v "$ANSIBLE_DIR":/ansible \
    -v "$KEYDIR/id_ed25519":/root/.ssh/sr_test_key:ro \
    -w /ansible sr-ansible "$@"
}

case "${1:-}" in
  up)
    docker build -q -t sr-ansible "$ANSIBLE_DIR" >/dev/null
    docker build -q -t sr-ansible-target -f "$HERE/target.Dockerfile" "$HERE" >/dev/null
    mkdir -p "$KEYDIR"
    [[ -f "$KEYDIR/id_ed25519" ]] || ssh-keygen -q -t ed25519 -N '' -f "$KEYDIR/id_ed25519" -C sr-ansible-test
    docker network inspect "$NET" >/dev/null 2>&1 || docker network create "$NET" >/dev/null
    docker rm -f "$TARGET" >/dev/null 2>&1 || true
    docker run -d --name "$TARGET" --hostname "$TARGET" --network "$NET" --privileged \
      -v sr-target-docker:/var/lib/docker -v sr-target-containerd:/var/lib/containerd \
      sr-ansible-target >/dev/null
    for i in $(seq 1 30); do
      docker exec "$TARGET" systemctl is-system-running 2>/dev/null | grep -qE 'running|degraded' && break
      sleep 1
    done
    docker exec "$TARGET" install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
    docker cp "$KEYDIR/id_ed25519.pub" "$TARGET":/home/deploy/.ssh/authorized_keys
    docker exec "$TARGET" chown deploy:deploy /home/deploy/.ssh/authorized_keys
    docker exec "$TARGET" chmod 600 /home/deploy/.ssh/authorized_keys
    echo "Cible prête : $TARGET (réseau $NET)"
    ;;
  run)
    ansible_run ansible-playbook -i test/inventory.test.ini playbook.yml "${@:2}"
    ;;
  verify)
    ansible_run ansible-playbook -i test/inventory.test.ini playbook.yml --tags verify
    ;;
  down)
    docker rm -f "$TARGET" >/dev/null 2>&1 || true
    docker network rm "$NET" >/dev/null 2>&1 || true
    docker volume rm sr-target-docker sr-target-containerd >/dev/null 2>&1 || true
    rm -rf -- "$KEYDIR"
    echo "Nettoyé."
    ;;
  *)
    echo "usage: $0 {up|run|verify|down}" >&2
    exit 1
    ;;
esac

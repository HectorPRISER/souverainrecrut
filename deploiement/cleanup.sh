#!/usr/bin/env bash
# Nettoyage de fin de TP : supprime la VM de déploiement, ses disques, l'ISO et la stack CI locale.
# Chaque suppression demande confirmation. Rien n'est supprimé sans réponse "o".
#
# Usage :   ./cleanup.sh            (interactif)
#           VM_NAME=sr-deploy ./cleanup.sh
#
# Ne désinstalle PAS les paquets système (qemu/libvirt) : voir les commandes affichées à la fin.
set -uo pipefail

VM_NAME="${VM_NAME:-sr-deploy}"
VM_DIR="${VM_DIR:-$HOME/SDV/ci-cd/vm}"
ISO_DIR="${ISO_DIR:-$HOME/SDV/ci-cd/iso}"
JENKINS_COMPOSE="$(cd "$(dirname "$0")/.." && pwd)/integration-continue/jenkins/docker-compose.yml"

ask() { read -r -p "$1 [o/N] " a; [[ "$a" == "o" || "$a" == "O" ]]; }

echo "== 1. VM libvirt '${VM_NAME}' =="
if command -v virsh >/dev/null && virsh --connect qemu:///system dominfo "$VM_NAME" >/dev/null 2>&1; then
  if ask "Arrêter et supprimer la VM '${VM_NAME}' et ses disques ?"; then
    virsh --connect qemu:///system destroy "$VM_NAME" 2>/dev/null || true
    virsh --connect qemu:///system undefine "$VM_NAME" --remove-all-storage --nvram 2>/dev/null \
      || virsh --connect qemu:///system undefine "$VM_NAME" --remove-all-storage
  fi
else
  echo "Aucune VM '${VM_NAME}' trouvée."
fi

echo "== 2. Dossier des disques de VM : ${VM_DIR} =="
if [[ -d "$VM_DIR" ]]; then
  du -sh "$VM_DIR"
  ask "Supprimer ${VM_DIR} ?" && rm -rf -- "$VM_DIR"
fi

echo "== 3. ISO Ubuntu dans ${ISO_DIR} =="
for f in "$ISO_DIR"/ubuntu-*.iso; do
  [[ -e "$f" ]] || continue
  ls -lh "$f"
  ask "Supprimer $(basename "$f") ?" && rm -f -- "$f"
done
echo "(Les ISO VMware ESXi / Workstation ne sont pas touchées.)"

echo "== 4. Stack CI locale (Jenkins, SonarQube, bases) =="
if [[ -f "$JENKINS_COMPOSE" ]] && command -v docker >/dev/null; then
  if ask "Arrêter Jenkins/SonarQube ET supprimer leurs volumes (historique des builds, analyses) ?"; then
    docker compose -f "$JENKINS_COMPOSE" down -v
  fi
fi
if docker inspect sr-pg-test >/dev/null 2>&1; then
  ask "Supprimer le conteneur de test sr-pg-test ?" && docker rm -f sr-pg-test
fi
if ask "Supprimer les images locales du TP (souverainrecrut-backend, jenkins buildé) ?"; then
  docker images --format '{{.Repository}}:{{.Tag}}' | grep -E 'souverainrecrut' | xargs -r docker rmi -f
fi

cat <<'EOF'

== Reste à faire à la main (non automatisé volontairement) ==
  # Paquets d'hyperviseur
  sudo apt purge qemu-kvm libvirt-daemon-system virtinst virt-manager && sudo apt autoremove
  # Retrait des groupes (si ajoutés)
  sudo gpasswd -d "$USER" libvirt; sudo gpasswd -d "$USER" kvm
  # Comptes externes : révoquer les tokens Docker Hub et GitLab, supprimer le projet GitLab de test
  # Clé SSH de déploiement : rm ~/.ssh/sr_deploy*  (si créée pour le TP)
EOF

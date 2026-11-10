# Cible de TEST uniquement : simule un serveur Ubuntu 22.04 (systemd + sshd) pour rejouer le playbook sans VM.
# Représente l'état "après installation d'Ubuntu" : utilisateur deploy créé, sudo sans mot de passe, SSH par clé.
# NE PAS utiliser en production. Le conteneur tourne en --privileged (Docker et UFW ont besoin de privilèges noyau).
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y --no-install-recommends systemd systemd-sysv openssh-server sudo python3 \
      iproute2 iptables ca-certificates kmod \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /run/sshd \
 && useradd -m -s /bin/bash deploy \
 && echo 'deploy ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/deploy \
 && chmod 440 /etc/sudoers.d/deploy \
 && systemctl enable ssh

STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]

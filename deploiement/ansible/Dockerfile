# Image d'exécution d'Ansible (versions fixées) : rien à installer sur la machine hôte.
#   docker build -t sr-ansible deploiement/ansible
FROM python:3.12.8-alpine3.21

RUN apk add --no-cache openssh-client git \
 && pip install --no-cache-dir ansible-core==2.17.7 ansible-lint==24.12.2 \
 && ansible-galaxy collection install community.general:9.5.3 --collections-path /usr/share/ansible/collections

WORKDIR /ansible
ENV ANSIBLE_FORCE_COLOR=0 \
    ANSIBLE_COLLECTIONS_PATH=/usr/share/ansible/collections

ENTRYPOINT []

# Procédure de déploiement — SouverainRecrut (backend)

Objectif : rejouer la chaîne complète, de zéro, par une personne tierce. Chaque section renvoie au README détaillé du dossier concerné.

## 0. Prérequis

- Machine Linux avec Docker et Docker Compose, ~10 Go de disque libres (SonarQube refuse de démarrer si le disque dépasse 95 %).
- Comptes GitHub, GitLab et Docker Hub (token Read & Write).
- Un fork du dépôt avec la branche `Dev`.
- QEMU/KVM + libvirt + virt-manager pour la VM (`sudo apt install qemu-kvm libvirt-daemon-system virtinst virt-manager`, puis se déconnecter/reconnecter pour les groupes `libvirt` et `kvm`).

## 1. Intégration continue (Jenkins, SonarQube)

Détail : `integration-continue/README.md`.

```bash
cd integration-continue/jenkins
cp .env.example .env              # renseigner DOCKERHUB_USER, DOCKERHUB_TOKEN, JENKINS_ADMIN_PASSWORD, GIT_REPO_URL (sans commentaire en fin de ligne)
docker compose up -d sonarqube    # attendre : curl -s localhost:9000/api/system/status  -> "UP"
curl -u admin:<mot-de-passe> -X POST localhost:9000/api/user_tokens/generate -d name=jenkins   # copier le token dans .env (SONAR_TOKEN)
SONAR_TOKEN=<token> ../sonar/setup-quality-gate.sh
docker compose up -d --build jenkins
```

Dans Jenkins (http://localhost:8080) : job `souverainrecrut-backend`, *Build with Parameters*, `DOCKERHUB_NAMESPACE` = votre compte Docker Hub, `PUSH_IMAGE` coché.
Attendu : 10 stages verts et `Image publiée : <compte>/souverainrecrut-backend:X.Y.Z-sha-xxxxxxx`.

## 2. Machine virtuelle

Créer la VM avec virt-manager : ISO Ubuntu, 2 vCPU, 4 Go de RAM, 30 Go, réseau `default` (NAT), nom `sr-deploy`, utilisateur `deploy`. Puis dans la VM :

```bash
sudo apt update && sudo apt install -y openssh-server python3
echo 'deploy ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/deploy && sudo chmod 440 /etc/sudoers.d/deploy
```

Sur la machine de travail, réserver l'IP `192.168.122.50` pour la VM (ou adapter `vm_ip`), générer la clé dédiée et la copier :

```bash
ssh-keygen -t ed25519 -N '' -f ~/.ssh/sr_deploy -C sr-deploy
ssh-copy-id -i ~/.ssh/sr_deploy.pub deploy@192.168.122.50
ssh -i ~/.ssh/sr_deploy deploy@192.168.122.50 'sudo -n true && echo OK'
virsh --connect qemu:///system snapshot-create-as sr-deploy avant-ansible
```

## 3. Terraform (inventaire) et Ansible (serveur)

Détail : `deploiement/README.md`, étapes 2 et 3.

```bash
cd deploiement
tf() { docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/work -w /work/terraform hashicorp/terraform:1.9.8 "$@"; }
tf init && tf validate && tf apply -auto-approve      # génère ansible/inventory.ini

docker build -t sr-ansible ansible
an() { docker run --rm -v "$PWD/ansible":/ansible -v ~/.ssh/sr_deploy:/root/.ssh/sr_deploy:ro --network host -w /ansible sr-ansible "$@"; }
an ansible-playbook -i inventory.ini playbook.yml     # attendu : failed=0
an ansible-playbook -i inventory.ini playbook.yml     # idempotence : changed=0
```

## 4. GitLab : projet, variables, runner

Détail : `deploiement/README.md`, étape 4.

1. Importer le dépôt dans GitLab. *Settings, CI/CD, General pipelines* : fichier de configuration = `deploiement/.gitlab-ci.yml`.
2. *Settings, CI/CD, Runners* : désactiver les runners d'instance, créer un runner de projet (« Run untagged jobs » coché).
3. Démarrer le runner : `cd deploiement/gitlab-runner && docker compose up -d`, puis enregistrer avec le token `glrt-...` (commande dans le README).
4. *Settings, CI/CD, Variables* (aucune **Protected**) : `DOCKERHUB_NAMESPACE`, `SERVER_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY_B64` (`base64 -w0 ~/.ssh/sr_deploy`, masquée),
   `POSTGRES_USER`, `POSTGRES_DB`, et par environnement (`staging`, `production`) : `POSTGRES_PASSWORD` et `JWT_SECRET` (masquées, `openssl rand -hex 16` et `-hex 32`).

## 5. Déployer

GitLab : *Build, Pipelines, Run pipeline*, branche `Dev`, variable `IMAGE_TAG` = tag publié par Jenkins (ex. `1.0.1-sha-5fde279`).
Attendu : `validate-*`, `deploy-staging`, `verify-staging` verts ; `deploy-production` en attente d'un clic sur ▶, puis `verify-production` vert.

## 6. Vérifier

```bash
curl http://192.168.122.50:4001/v1/ready      # staging    : "database":"CONNECTED"
curl http://192.168.122.50:4000/v1/ready      # production
curl http://192.168.122.50:4001/v1/info       # version exposée par l'API
ssh -i ~/.ssh/sr_deploy deploy@192.168.122.50 'docker ps --format "{{.Names}} {{.Image}} {{.Status}}"'
```

## 7. Revenir en arrière

Voir `procedure-rollback.md` : relancer le pipeline GitLab avec l'ancien `IMAGE_TAG`.

## 8. Nettoyage de fin de TP

`deploiement/cleanup.sh` (interactif) supprime la VM, ses disques, l'ISO et la stack CI. À faire à la main : purger les paquets d'hyperviseur, révoquer les tokens
(Docker Hub, GitLab, SonarQube, runner) et supprimer la clé `~/.ssh/sr_deploy*`.

## Dépannage

Chaque README contient un tableau de dépannage (`integration-continue/README.md`, `deploiement/README.md`). Les erreurs les plus fréquentes :
disque au-delà de 95 % (SonarQube), token Docker Hub en lecture seule, job pris par un runner partagé GitLab, clé SSH mal collée, variable GitLab « Protected » ou mal limitée à un environnement.

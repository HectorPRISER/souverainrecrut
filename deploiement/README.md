# SouverainRecrut — CI/CD Jour 2 : provisionnement et déploiement

Périmètre **Backend uniquement**. Ce README est complété étape par étape.

Chaîne cible :

```
VM Ubuntu (QEMU/KVM) → Terraform → Ansible → GitLab CI/CD → pull image Docker Hub → Docker Compose + PostgreSQL
```

| Étape | Contenu | État |
|-------|---------|------|
| 1 | Docker Compose + migrations Prisma (`deployment/`) | Fait et testé en local |
| 2 | Terraform (`terraform/`) | Fait et testé (via Docker) |
| 3 | Ansible (`ansible/`) | Fait et testé sur la cible simulée ET sur la vraie VM (voir ci-dessous) |
| 4 | Pipeline GitLab (`.gitlab-ci.yml`), staging auto + production manuelle | Scripts testés sur la vraie VM (staging) ; pipeline GitLab à exécuter une fois les variables et le runner en place |
| 5 | Rollback et vérifications | À faire |
| 6 | Documentation finale (`../documentation/`) | À faire |

---

## Étape 1 — Docker Compose et migrations Prisma

Fichiers : `deployment/docker-compose.yml`, `deployment/.env.example`.

### Services

| Service | Rôle |
|---------|------|
| `postgres` | PostgreSQL 16, volume persistant `pgdata`, healthcheck `pg_isready` |
| `schema-sync` | Copie `prisma/` (schéma + migrations) **depuis l'image backend déployée** vers un volume partagé |
| `migrate` | Image `node:22.16.0-alpine3.22` + CLI Prisma épinglée, exécute `prisma migrate deploy` (jamais de reset) |
| `init-admin` | Crée un compte ADMIN depuis `ADMIN_EMAIL` / `ADMIN_PASSWORD` s'il n'existe pas (idempotent, aucun seed destructif) |
| `api` | Image backend de Docker Hub, port `API_PORT`, healthcheck sur `/v1/ready`, `restart: unless-stopped` |

Ordre garanti par `depends_on` : `postgres` sain → `schema-sync` → `migrate` → `api` (et `init-admin`).

### Choix techniques

- **Migrations** : l'image backend n'embarque pas la CLI Prisma. Plutôt que de la republier, le schéma est extrait de l'image
  déployée : la migration est donc toujours alignée sur la version du code. Limite : `npx` télécharge la CLI Prisma, la VM doit
  avoir accès à Internet.
- **Rollback et schéma** : un retour à une image précédente ne défait pas les migrations déjà appliquées. À traiter à l'étape 5
  (migrations rétro-compatibles).
- **Environnements multiples** : `COMPOSE_PROJECT_NAME` et `API_PORT` différents permettent staging et production sur la même VM,
  avec volumes, réseaux et conteneurs distincts.
- **Image** : tag immuable `version-sha-commit` produit par Jenkins, jamais `latest`.
- **Secrets** : aucun dans le dépôt. `.env` est ignoré par git ; en pipeline les valeurs viennent des variables GitLab masquées.

### Utilisation

```bash
cd deploiement/deployment
cp .env.example .env        # renseigner BACKEND_IMAGE, mots de passe, JWT_SECRET, ADMIN_*
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f api
```

Vérification :

```bash
curl http://localhost:4000/v1/ready          # {"success":true, ... "database":"CONNECTED"}
curl -X POST http://localhost:4000/v1/auth/login -H 'content-type: application/json' \
     -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'
```

### Résultats du test local (image du Jour 1, `souverainrecrut-backend:local`)

- Postgres `healthy`, migration `20260630124434_init` appliquée, API `healthy`.
- `/v1/ready` : `CONNECTED` ; login de l'admin créé par `init-admin` : OK ; `/v1/dashboard/stats` : OK.
- `down` puis `up` (sans `-v`) : données conservées, « No pending migrations to apply », admin non dupliqué.
- Bug corrigé pendant le test : Compose interprétait `$disconnect` du script JS comme une variable (échappé en `$$disconnect`).

### Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `variable is not set` au `up` | `.env` incomplet | Compléter `.env` d'après `.env.example` |
| `migrate` en échec | Pas d'accès Internet pour `npx` ou base non prête | `docker compose logs migrate` ; vérifier le réseau de la VM |
| Port déjà utilisé | Autre environnement sur le même `API_PORT` | Changer `API_PORT` |
| `api` reste `unhealthy` | Base inaccessible ou `JWT_SECRET` absent | `docker compose logs api` |

---

## Étape 2 — Terraform

Dossier : `terraform/` — `providers.tf`, `variables.tf`, `main.tf`, `outputs.tf`, `templates/inventory.ini.tftpl`,
`terraform.tfvars.example`, `vsphere.tf.example`.

### Ce que fait Terraform ici (et pourquoi)

Le provider vSphere exige ESXi + vCenter. Ici la VM Ubuntu est créée **à la main** (QEMU/KVM, NAT libvirt) : Terraform ne peut donc pas la
créer, ce que le cahier des charges prévoit explicitement (« Sans ESXi/vCenter, la création initiale de la VM est manuelle »).
Terraform décrit ce qui est réellement disponible :

- il prend en **variables** la cible de déploiement (IP, utilisateur SSH, chemin de la clé, répertoire de déploiement) ;
- il **génère l'inventaire Ansible** `ansible/inventory.ini` (ressource `local_file` + gabarit), qui devient la source unique de vérité
  consommée à l'étape 3 ;
- il expose des **sorties** : IP, chemin de l'inventaire, commande SSH, commande Ansible suivante.

La **variante vSphere** (création réelle de la VM : datacenter, datastore, réseau, template, 2 vCPU / 4 Go / 30 Go) est fournie dans
`vsphere.tf.example`. Le fichier est inactif (extension `.example`) et documente la démarche, non exécutée faute d'ESXi/vCenter.

### Variables

| Variable | Défaut | Rôle |
|----------|--------|------|
| `vm_name` | `sr-deploy` | Alias de la VM dans l'inventaire |
| `vm_ip` | `192.168.122.50` | IP de la VM (validée : IPv4) |
| `ssh_user` | `deploy` | Utilisateur SSH |
| `ssh_port` | `22` | Port SSH |
| `ssh_private_key_path` | `~/.ssh/sr_deploy` | Chemin de la clé privée (seul le chemin est écrit, jamais son contenu) |
| `deploy_dir` | `/opt/souverainrecrut` | Dossier de déploiement créé par Ansible |
| `inventory_path` | `../ansible/inventory.ini` | Fichier généré |

Surcharge : copier `terraform.tfvars.example` en `terraform.tfvars` (ignoré par git).

### Choix techniques

- **Aucun secret dans Terraform** : pas de clé privée ni de mot de passe générés ou stockés dans le state (`terraform.tfstate` est ignoré par git).
- **Terraform lancé via Docker** (image `hashicorp/terraform:1.9.8` fixée) : rien à installer sur la machine.
- **Providers** : `hashicorp/local ~> 2.5` ; `.terraform.lock.hcl` versionné pour des installations reproductibles.

### Tester

Alias pratique (depuis `deploiement/`) :

```bash
cd deploiement
tf() { docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/work -w /work/terraform hashicorp/terraform:1.9.8 "$@"; }

tf fmt -check          # formatage            → aucune sortie
tf init                # providers            → "Terraform has been successfully initialized"
tf validate            # syntaxe              → "Success! The configuration is valid."
tf plan                # prévisualisation     → "Plan: 1 to add, 0 to change, 0 to destroy."
tf apply -auto-approve # génère l'inventaire  → "Apply complete! Resources: 1 added"
cat ansible/inventory.ini
tf plan                # idempotence          → "No changes. Your infrastructure matches the configuration."
```

Vérifications supplémentaires :

```bash
tf plan -var vm_ip=abc          # → Error: "vm_ip doit être une adresse IPv4"
tf apply -auto-approve -var vm_ip=192.168.122.60   # → "1 added, 1 destroyed" : le fichier est remplacé, ansible_host=192.168.122.60
tf apply -auto-approve                             # remet l'IP par défaut (192.168.122.50)
```

Résultats réellement obtenus : `fmt` propre, `validate` OK, plan `1 to add`, apply OK, inventaire correct, second plan `No changes`,
IP invalide refusée.

> Avec Terraform installé en local, remplacer `tf` par `terraform` (depuis `deploiement/terraform/`).

### Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `permission denied` sur `.terraform` ou `ansible/` | Conteneur lancé en root | Garder `-u "$(id -u):$(id -g)"` dans l'alias |
| `Failed to query available provider packages` | Pas d'accès Internet | Vérifier le réseau, relancer `tf init` |
| L'inventaire n'est pas mis à jour | Variable non prise en compte | Vérifier `terraform.tfvars` ; `tf apply` recrée le fichier |

---

## Étape 3 — Ansible

Dossier : `ansible/` — `playbook.yml`, `ansible.cfg`, `inventory.ini` (généré par Terraform), `Dockerfile` (image d'exécution
Ansible), `test/` (cible de test simulée).

### Ce que fait le playbook

| Bloc | Tâches |
|------|--------|
| Contrôles préalables | La cible est un Ubuntu ; l'utilisateur de déploiement existe |
| Système | Mise à jour de l'index et du système (`upgrade_system`), dépendances (`ca-certificates`, `curl`, `gnupg`, `ufw`) |
| Docker | Clé GPG et dépôt APT **officiels**, installation de `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin`, `docker-compose-plugin` ; service `docker` démarré et activé ; utilisateur de déploiement ajouté au groupe `docker` |
| Répertoires | `/opt/souverainrecrut/` + un dossier par environnement : `production/` et `staging/` (propriétaire = utilisateur de déploiement) |
| Pare-feu | UFW : SSH autorisé **avant** l'activation, puis 4000 (production) et 4001 (staging), refus du reste en entrée |
| Vérifications (tag `verify`) | Service Docker actif et activé, versions Docker/Compose, démon qui répond, groupe `docker`, dossiers présents, pare-feu actif, résumé |

### Choix techniques

- **Idempotent** : relançable sans effet de bord (2e exécution : `changed=0`).
- **Utilisateur `deploy` créé à l'installation d'Ubuntu** (bootstrap manuel, voir ci-dessous) ; le playbook le vérifie et n'y touche que pour le groupe `docker`.
- **Pare-feu** : SSH est ouvert avant l'activation d'UFW pour ne pas se couper l'accès. Désactivable : `-e firewall_enabled=false`.
- **Limite connue d'UFW avec Docker** : Docker publie les ports par ses propres règles `iptables` et **contourne UFW**. Les ports 4000/4001 sont
  de toute façon publiés volontairement ; UFW protège les autres services de la machine. Pour restreindre aussi les ports Docker, il faudrait agir
  sur la chaîne `DOCKER-USER` (hors périmètre du TP).
- **Clé d'hôte SSH** : `StrictHostKeyChecking=accept-new` (acceptée au premier contact, tout changement ensuite est refusé).
- **Ansible lancé via Docker** (`ansible/Dockerfile` : `ansible-core 2.17.7`, `ansible-lint 24.12.2`, collection `community.general 9.5.3`).
- **Qualité** : `ansible-playbook --syntax-check` et `ansible-lint` passent (profil `production`).

### Préparer la VM (bootstrap manuel, une seule fois)

À l'installation d'Ubuntu, créer l'utilisateur `deploy`, puis sur la VM :

```bash
sudo apt update && sudo apt install -y openssh-server python3
echo 'deploy ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/deploy && sudo chmod 440 /etc/sudoers.d/deploy
```

Sur ta machine : générer la clé dédiée et la copier sur la VM (la clé privée ne va **jamais** dans le dépôt) :

```bash
ssh-keygen -t ed25519 -N '' -f ~/.ssh/sr_deploy -C sr-deploy
ssh-copy-id -i ~/.ssh/sr_deploy.pub deploy@192.168.122.50
ssh -i ~/.ssh/sr_deploy deploy@192.168.122.50 'sudo -n true && echo OK'     # attendu : OK
```

### Lancer sur la vraie VM

```bash
cd deploiement
docker build -t sr-ansible ansible
an() { docker run --rm -v "$PWD/ansible":/ansible -v ~/.ssh/sr_deploy:/root/.ssh/sr_deploy:ro --network host -w /ansible sr-ansible "$@"; }

an ansible-playbook -i inventory.ini playbook.yml --syntax-check
an ansible-lint playbook.yml
an ansible-playbook -i inventory.ini playbook.yml                 # préparation du serveur
an ansible-playbook -i inventory.ini playbook.yml --tags verify   # vérifications seules
```

(L'inventaire généré par Terraform référence `~/.ssh/sr_deploy`, monté en `/root/.ssh/sr_deploy` dans le conteneur.)

### Tester sans VM (cible Ubuntu simulée)

`ansible/test/` contient un conteneur Ubuntu 22.04 avec systemd + sshd qui représente l'état « après installation » (utilisateur `deploy`, sudo sans
mot de passe, SSH par clé). Il tourne en `--privileged` (Docker et UFW ont besoin de privilèges noyau) : **outil de test jetable, jamais pour la production**.

```bash
cd deploiement/ansible/test
./run-test.sh up        # construit l'image Ansible + la cible, génère une clé SSH jetable (dans /tmp)
./run-test.sh run       # 1er run : "ok=24 changed=11 failed=0"
./run-test.sh run       # 2e run  : "ok=24 changed=0"   → idempotent
./run-test.sh verify    # vérifications seules          → "ok=9 changed=0"
docker exec sr-target docker --version        # Docker Engine installé dans la cible
./run-test.sh down      # supprime cible, réseau, volumes et clé
```

Résultats réellement obtenus : syntax-check OK, ansible-lint OK ; 1er run `ok=24 changed=11 failed=0` ; 2e run `ok=24 changed=0` ;
vérifications OK (Docker 29.9.3, Compose v5.7.0, service actif, UFW actif avec 22/4000/4001, dossiers `production` et `staging` à `deploy:deploy`).

Limite : la cible simulée valide la logique du playbook, pas la VM réelle (noyau, réseau libvirt, Ubuntu Desktop 22.04 avec ses paquets préinstallés).
À rejouer sur la VM dès qu'elle existe.

### Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `Permission denied (publickey)` | Clé non copiée ou mauvais chemin | Refaire `ssh-copy-id` ; tester `ssh -i ~/.ssh/sr_deploy deploy@IP` |
| `sudo: a password is required` | `deploy` n'a pas le sudo sans mot de passe | Créer `/etc/sudoers.d/deploy` (voir bootstrap) |
| `No route to host` / timeout | VM éteinte ou mauvaise IP | Vérifier `vm_ip` dans Terraform, relancer `tf apply` |
| `Host key verification failed` | La clé d'hôte de la VM a changé (VM réinstallée) | `ssh-keygen -R <IP>` puis relancer |
| `Statut du pare-feu` en échec alors qu'UFW est actif | Serveur en français : `ufw status` répond `État : actif` | Corrigé (`LC_ALL=C` sur la tâche) ; rejouer le playbook |
| UFW te coupe SSH | Port SSH non standard | Définir `ansible_port` dans l'inventaire (déjà pris en compte) ; ou `-e firewall_enabled=false` |

---

## Étape 4 — Pipeline GitLab CI/CD

Fichiers : `.gitlab-ci.yml`, `scripts/common.sh`, `scripts/deploy.sh`, `scripts/verify.sh`, `gitlab-runner/docker-compose.yml`.

### Principe

Le pipeline **tire** l'image publiée par Jenkins sur Docker Hub et la déploie par SSH + Docker Compose. Il ne reconstruit jamais l'image
depuis le code source (consigne 5.1 du cahier). Il se lance **à la demande** (CI/CD, Pipelines, *Run pipeline*) avec la variable `IMAGE_TAG`
(ex. `1.0.0-sha-aab7d05`) : pas de déploiement involontaire à chaque push.

```
validate (tag + compose) → deploy-staging (auto) → verify-staging → deploy-production (APPROBATION MANUELLE) → verify-production
```

| Job | Rôle |
|-----|------|
| `validate-image-tag` | Refuse un tag vide, `latest`, ou hors format `X.Y.Z-sha-xxxxxxx` ; vérifie que le tag existe sur Docker Hub |
| `validate-compose` | `docker compose config` sur `docker-compose.yml` avec des valeurs factices |
| `deploy-staging` | Script `deploy.sh` : SSH, copie de `docker-compose.yml`, génération du `.env`, `docker compose pull` puis `up -d` |
| `verify-staging` | Script `verify.sh` : services, migrations (code de sortie 0), API prête (`/v1/ready` = `CONNECTED`), `/v1/health` = `UP` |
| `deploy-production` | Idem, **`when: manual`** : le pipeline s'arrête jusqu'à validation humaine |
| `verify-production` | Mêmes vérifications sur la production |

Deux environnements sur la même VM : `staging` (port 4001, dossier `/opt/souverainrecrut/staging`) et `production` (port 4000, dossier
`/opt/souverainrecrut/production`), avec projets Compose, volumes et réseaux distincts. Ces ports sont ceux ouverts par le pare-feu d'Ansible.

### Choix techniques

- **Secrets dans GitLab, jamais dans le dépôt** : variables CI/CD masquées, **limitées par environnement** (staging et production ont des secrets distincts).
  `deploy.sh` écrit le `.env` dans un fichier temporaire (`umask 077`), le copie par `scp`, puis `chmod 600`. Le contenu n'est jamais affiché.
- **Clé SSH** : variable de type *File* (`SSH_PRIVATE_KEY`), jamais écrite dans les logs. Empreinte du serveur : `SSH_KNOWN_HOSTS` (recommandé) ;
  sans elle, elle est récupérée au premier contact (avertissement dans le log).
- **Rollback préparé** : avant chaque déploiement, l'ancien `.env` est copié en `.env.previous` sur le serveur (étape 5).
- **`resource_group`** par environnement : deux déploiements ne s'exécutent jamais en parallèle sur le même environnement.
- **Logique dans des scripts** (`scripts/*.sh`) plutôt que dans le YAML : testables et vérifiés avec `shellcheck`.
- **Dépôt GitLab** : le projet est l'import complet du dépôt GitHub, donc le fichier est dans `deploiement/`. Régler dans GitLab :
  *Settings, CI/CD, General pipelines, CI/CD configuration file* = `deploiement/.gitlab-ci.yml`.
- **Dépôt d'images public** : le serveur tire sans authentification. Si le dépôt devient privé, définir `DOCKERHUB_USER` et `DOCKERHUB_TOKEN` : `deploy.sh` se connecte alors à Docker Hub.

### Variables CI/CD à créer dans GitLab

*Settings, CI/CD, Variables.* Cocher **Mask variable** pour les secrets, et ne **pas** cocher « Expand variable reference » si la valeur contient `$`.
Les variables masquées exigent 8 caractères minimum, sans espace (évite aussi `$` et `#` : le `.env` les interpréterait).

| Variable | Type | Portée | Exemple / rôle |
|----------|------|--------|----------------|
| `DOCKERHUB_NAMESPACE` | Variable | Toutes | `hector29600` |
| `SERVER_HOST` | Variable | Toutes | IP de la VM (ex. `192.168.122.50`) |
| `SSH_USER` | Variable | Toutes | `deploy` |
| `SSH_PRIVATE_KEY` | **File** | Toutes | Contenu de `~/.ssh/sr_deploy` (terminer par un retour à la ligne) |
| `SSH_KNOWN_HOSTS` | File (optionnel) | Toutes | Sortie de `ssh-keyscan <IP>` |
| `POSTGRES_USER` | Variable | `staging` et `production` | `souverain` |
| `POSTGRES_DB` | Variable | `staging` et `production` | `souverainrecrut` |
| `POSTGRES_PASSWORD` | Masquée | **une valeur par environnement** | Mot de passe distinct staging / production |
| `JWT_SECRET` | Masquée | **une valeur par environnement** | Chaîne aléatoire longue (`openssl rand -hex 32`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Variable / Masquée | par environnement (optionnel) | Admin initial pour tester le login |
| `DOCKERHUB_USER`, `DOCKERHUB_TOKEN` | Variable / Masquée | Toutes (optionnel) | Seulement si le dépôt d'images est privé |

### Installer le runner local (à faire quand la VM existe)

Le runner s'exécute sur ta machine pour joindre la VM (réseau libvirt `192.168.122.x`), ce qu'un runner partagé du cloud ne peut pas faire.

1. Dans GitLab : *Settings, CI/CD, Runners, New project runner* (décocher « Run untagged jobs » seulement si tu utilises des tags). Copie le token `glrt-...`.
2. Lance le runner et enregistre-le :
   ```bash
   cd deploiement/gitlab-runner
   docker compose up -d
   docker compose exec runner gitlab-runner register --non-interactive \
     --url https://gitlab.com --token <glrt-...> --executor docker \
     --docker-image alpine:3.21 --docker-network-mode host --description sr-local-runner
   ```
3. Vérifie dans GitLab que le runner apparaît en vert. Ne commite jamais le token.

### Tester

**Validations statiques (faites, sans serveur) :**

```bash
cd ~/SDV/ci-cd/souverainrecrut
# 1. Les scripts : aucune alerte
docker run --rm -v "$PWD/deploiement/scripts":/mnt koalaman/shellcheck:v0.10.0 -x common.sh deploy.sh verify.sh
# 2. Le docker-compose.yml avec des valeurs factices, dans l'image que le job utilisera
docker run --rm -v "$PWD":/w -w /w docker:27-cli sh -c 'printf "COMPOSE_PROJECT_NAME=ci\nBACKEND_IMAGE=ns/x:0.0.0-sha-0000000\nPOSTGRES_USER=u\nPOSTGRES_PASSWORD=p\nPOSTGRES_DB=d\nJWT_SECRET=s\n" > /tmp/e && docker compose --env-file /tmp/e -f deploiement/deployment/docker-compose.yml config -q && echo OK'
# 3. Le format de tag
for t in 1.0.0-sha-aab7d05 latest 1.0.0; do echo "$t" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+-sha-[0-9a-f]{7}$' && echo "$t accepté" || echo "$t refusé"; done
```

Résultats obtenus : `shellcheck` propre ; `compose config` OK dans `docker:27-cli` ; le bloc `script` de `validate-compose`, extrait du YAML et exécuté, affiche
« docker-compose.yml valide. » ; tags : `1.0.0-sha-aab7d05` accepté, `latest` et `1.0.0` refusés.

**Test réel (une fois VM, projet GitLab, variables et runner en place) :**

1. Pousse la branche `Dev` vers GitLab (le projet est un import : `git remote add gitlab https://gitlab.com/HectorPRISER1/souverainrecrut.git && git push gitlab Dev`).
2. GitLab : *Build, Pipelines, Run pipeline*, branche `Dev`, variable `IMAGE_TAG` = `1.0.0-sha-aab7d05`.
3. Attendu : `validate-*` verts, `deploy-staging` puis `verify-staging` verts, `deploy-production` en attente (bouton ▶).
4. Clique sur ▶ : `deploy-production` puis `verify-production` passent.
5. Contrôle : `curl http://<IP>:4001/v1/ready` et `curl http://<IP>:4000/v1/ready`, tous deux avec `"database":"CONNECTED"`.
6. Tests négatifs : relancer avec `IMAGE_TAG=latest` (refusé), avec un tag inexistant `1.0.0-sha-0000000` (refusé par Docker Hub).

### Tester les scripts de déploiement sur la VM, sans GitLab

`scripts/run-local.sh` exécute `deploy.sh` ou `verify.sh` depuis ta machine, dans un conteneur `alpine` jetable (comme le runner), avec les mêmes
variables que GitLab fournirait. Il ne touche pas à ton `~/.ssh`.

```bash
cd deploiement
./scripts/run-local.sh deploy staging      # déploie l'image en staging (port 4001)
./scripts/run-local.sh verify staging      # vérifie
curl http://192.168.122.50:4001/v1/ready   # → {"success":true,"data":{"status":"READY","database":"CONNECTED",...}}
```

Au premier lancement, le script crée `scripts/local.<env>.env` (secrets aléatoires, droits 600, ignoré par git) qui joue le rôle des variables CI/CD.

Résultat réellement obtenu sur `sr-deploy` (staging) : image `hector29600/souverainrecrut-backend:1.0.0-sha-aab7d05` tirée de Docker Hub,
`postgres` et `api` en `healthy`, `schema-sync`, `migrate` et `init-admin` en `Exited (0)` (migration appliquée), `/v1/ready` : `CONNECTED`,
`/v1/health` : `UP`, `verify.sh` : « Vérification réussie (staging) ».

### Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Aucun pipeline ne démarre | Le pipeline n'est lancé que par *Run pipeline* | Lancer à la main ; vérifier le chemin `deploiement/.gitlab-ci.yml` dans les settings |
| `This job is stuck` | Aucun runner disponible | Enregistrer le runner (section ci-dessus), vérifier qu'il est en ligne |
| `variables CI/CD manquantes : ...` | Variable non créée ou limitée à un autre environnement | Vérifier le nom et la portée (staging / production) |
| `Host key verification failed` | `SSH_KNOWN_HOSTS` obsolète (VM réinstallée) | Régénérer avec `ssh-keyscan <IP>` |
| `Permission denied (publickey)` | `SSH_PRIVATE_KEY` mal collée (pas de retour à la ligne final) ou clé non copiée sur la VM | Recoller la clé complète ; `ssh-copy-id` |
| `Tag introuvable sur Docker Hub` | Mauvais `DOCKERHUB_NAMESPACE`, tag erroné, ou dépôt privé | Vérifier le tag publié par Jenkins |
| Variable masquée refusée à la création | Valeur trop courte ou caractères interdits | Utiliser 8+ caractères alphanumériques (`openssl rand -hex 16`) |

### Test sur la vraie VM (`sr-deploy`, QEMU/KVM, Ubuntu 22.04.5 Desktop, IP 192.168.122.50)

Création de la VM : virt-manager, ISO Ubuntu 22.04.5 Desktop, 2 vCPU, 4 Go, 30 Go, réseau `default` (NAT), utilisateur `deploy`. Snapshot `avant-ansible` pris avant la configuration.

- Premier run réel : 24 tâches, système mis à jour, Docker installé (dépôt officiel), UFW activé, dossiers créés.
- État contrôlé ensuite par SSH : Docker 29.9.3, Compose v5.7.0, service `active`/`enabled`, `deploy` dans le groupe `docker`,
  `/opt/souverainrecrut/{production,staging}` à `deploy:deploy`, UFW actif (22, 4000, 4001 en IPv4 et IPv6).
- **Défaut trouvé grâce à ce test** : la vérification du pare-feu cherchait `Status: active`, or la VM est en français (`État : actif`). Corrigé avec `LC_ALL=C`.
- Un redémarrage est requis après la mise à jour du noyau (`/var/run/reboot-required`) : `sudo reboot` sur la VM, sans conséquence pour la suite.

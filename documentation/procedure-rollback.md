# Procédure de rollback — SouverainRecrut (backend)

Objectif : revenir à une version antérieure de l'API en cas de problème après un déploiement, de façon **rapide, traçable et sans perte de données**.

## 1. Principe

- Chaque build Jenkins publie une image Docker avec un **tag immuable** `X.Y.Z-sha-<commit>` (ex. `1.0.1-sha-5fde279`), relié à un commit précis.
  Les tags `X.Y.Z` (ex. `1.0.1`) sont des alias mobiles : on ne déploie **jamais** un alias ni `latest`.
- Le pipeline de déploiement GitLab **tire** l'image choisie sur Docker Hub, sans jamais la reconstruire. Revenir en arrière, c'est donc
  **redéployer l'ancien tag** : même chemin, mêmes contrôles que pour un déploiement normal.
- Les données PostgreSQL sont dans un volume Docker (`pgdata`) distinct des conteneurs : un redéploiement ou un rollback d'image ne les touche pas.

Versions disponibles (Docker Hub `hector29600/souverainrecrut-backend`) :

| Tag immuable | Contenu |
|--------------|---------|
| `1.0.0-sha-aab7d05` | Première version publiée par Jenkins |
| `1.0.1-sha-5fde279` | Version exposée par l'API (`GET /v1/info` annonce la version), namespace corrigé |

Identifier la version qui tourne :

```bash
curl http://<IP>:4001/v1/info     # staging    → "version": "1.0.1"
curl http://<IP>:4000/v1/info     # production → "version": "1.0.1"
ssh deploy@<IP> 'docker ps --format "{{.Names}} {{.Image}}" | grep api'
```

> Les images antérieures à `1.0.1` annoncent toujours `1.0.0` : leur version est écrite en dur. Se fier au **tag de l'image** (commande `docker ps`) en cas de doute.

## 2. Quand déclencher un rollback

- `verify-staging` ou `verify-production` en échec après un déploiement ;
- API qui ne répond plus (`/v1/ready` ≠ `READY`), erreurs 5xx en nombre ;
- régression fonctionnelle constatée après mise en ligne.

Règle : **tester d'abord en staging** (déploiement automatique), ne laisser passer en production (approbation manuelle) qu'une version qui a réussi `verify-staging`.

## 3. Procédure standard : pipeline GitLab (recommandée)

1. Repérer le **dernier tag sain** : l'ancien pipeline réussi, ou la liste des tags sur Docker Hub, ou `BACKEND_IMAGE` dans `/opt/souverainrecrut/<env>/.env.previous` sur le serveur.
2. GitLab : *Build, Pipelines, Run pipeline* (`.../-/pipelines/new`), branche `Dev`, variable **`IMAGE_TAG`** = ancien tag (ex. `1.0.0-sha-aab7d05`).
3. Le pipeline enchaîne `validate-image-tag` (le tag doit exister), `deploy-staging`, `verify-staging`.
4. Pour la production : cliquer sur ▶ `deploy-production` (**l'approbation manuelle s'applique aussi à un retour arrière**), puis `verify-production` contrôle l'état.
5. Contrôler :
   ```bash
   curl http://<IP>:<port>/v1/ready                           # READY, base CONNECTED
   ssh deploy@<IP> 'docker ps --format "{{.Names}} {{.Image}}" | grep api'   # ancien tag
   ```

Chaque déploiement conserve l'ancien `.env` en `.env.previous` (sur le serveur) : la configuration précédente reste disponible, avec son tag.

## 4. Procédure de secours : manuelle sur le serveur

À utiliser seulement si GitLab ou le runner est indisponible.

```bash
ssh deploy@<IP>
cd /opt/souverainrecrut/staging            # ou production
grep ^BACKEND_IMAGE .env .env.previous     # repérer l'ancien tag
sed -i 's#^BACKEND_IMAGE=.*#BACKEND_IMAGE=hector29600/souverainrecrut-backend:1.0.0-sha-aab7d05#' .env
docker compose pull
docker compose up -d
docker compose ps
curl -s http://127.0.0.1:<port>/v1/ready
```

Le `.env` n'est jamais versionné ni affiché : il est mis à jour directement sur le serveur.

## 5. Limite importante : les migrations Prisma

**Un rollback d'image ne défait pas les changements de schéma de la base.** Au démarrage, le service `migrate` applique `prisma migrate deploy` avec les migrations
**contenues dans l'image déployée** (extraites par `schema-sync`). Il ne sait qu'avancer : il ne retire jamais une migration.

Conséquences :

- Si une version N+1 a ajouté une migration (nouvelle table ou colonne) et qu'on revient à la version N, la base **garde le schéma de N+1**.
  Le code de N doit alors fonctionner avec ce schéma plus récent.
- Un retour arrière est donc sûr **uniquement si les migrations sont rétro-compatibles**.

Règles de conception pour que le rollback reste possible :

1. **Migrations additives** : ajouter des colonnes nullables ou avec valeur par défaut, ajouter des tables ; ne pas renommer ni supprimer dans la même version.
2. **Suppression en deux temps** : version N+1 cesse d'utiliser la colonne, version N+2 la supprime.
3. **Pas de migration destructive** (`DROP`, changement de type) sans sauvegarde préalable.
4. **Sauvegarder avant une migration risquée** :
   ```bash
   ssh deploy@<IP> 'cd /opt/souverainrecrut/production && docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup-$(date +%F).sql
   ```
5. Si la base doit revenir en arrière malgré tout : restauration depuis la sauvegarde (perte des écritures faites depuis), pas de « migration inverse » automatique.

Dans le scénario testé ci-dessous, la version 1.0.1 n'ajoute **aucune migration** (une seule migration `init` existe) : le rollback est sans risque pour le schéma.

## 6. Scénario testé (staging, VM réelle)

| Étape | Action | Résultat observé |
|-------|--------|------------------|
| 1 | État initial : staging en `1.0.0-sha-aab7d05` ; création du candidat « Test Rollback » via l'API | `/v1/info` : `1.0.0` ; 1 candidat |
| 2 | Pipeline GitLab avec `IMAGE_TAG=1.0.1-sha-5fde279` | Tous les jobs verts ; `/v1/info` : `1.0.1` ; **le candidat est toujours présent** (persistance) |
| 3 | **Rollback** : pipeline GitLab avec `IMAGE_TAG=1.0.0-sha-aab7d05` | `deploy-staging` et `verify-staging` verts ; `/v1/info` : `1.0.0` ; image `1.0.0-sha-aab7d05` en cours d'exécution |
| 4 | Contrôle des données | Le candidat « Test Rollback » est **toujours présent** : le rollback d'image n'affecte pas les données |
| 5 | Contrôle de la configuration conservée | `.env.previous` contient l'image de la version précédente de chaque environnement |

Note : lors du test, la production a aussi été déployée en `1.0.1` après approbation manuelle du job `deploy-production`.
Elle illustre que l'approbation humaine protège l'environnement le plus sensible, et qu'un rollback de production se déroule exactement comme celui du staging.

## 7. Après un rollback

- Noter l'incident et le tag fautif (ticket, message de commit).
- Corriger dans un nouveau commit, laisser Jenkins publier un **nouveau** tag, le valider en staging avant de le proposer en production.
- Ne jamais réécrire un tag existant : un tag `-sha-` est définitif.

# Rapport final — SouverainRecrut CI/CD

Le rapport final complet, mis en forme avec le schéma d'architecture et les **emplacements des 14 captures d'écran**, est le document en ligne
« SouverainRecrut — Rapport final CI/CD » (exportable en Google Docs, Word ou PDF). Ce fichier en est le résumé versionné avec le code.

## Ce qui a été réalisé

- **Intégration continue** : Jenkins (configuré par fichier), 59 tests sur PostgreSQL réel, couverture 100 %, SonarQube avec Quality Gate (Passed), image Docker durcie,
  scan Trivy (0 CRITICAL), publication sur Docker Hub (`1.0.0-sha-aab7d05`, `1.0.1-sha-5fde279`).
- **Provisionnement** : VM Ubuntu sous QEMU/KVM, Terraform (inventaire Ansible généré, variante vSphere documentée), Ansible (Docker, Compose, dossiers, pare-feu ; `changed=0` au second passage).
- **Déploiement** : Docker Compose (PostgreSQL, migrations Prisma, API), pipeline GitLab CI/CD (staging automatique, production après approbation manuelle), runner local.
- **Persistance et rollback** : donnée conservée au déploiement et au retour arrière, rollback `1.0.1` vers `1.0.0` en un pipeline.
- **Documentation** : README par dossier, `architecture.md`, `procedure-deploiement.md`, `procedure-rollback.md`, ce rapport.

## Résultats mesurés

| Contrôle | Résultat |
|----------|----------|
| Tests | 59 sur 59 (9 suites), couverture 100 % |
| Quality Gate SonarQube | Passed ; 0 bug, 0 vulnérabilité, 0 hotspot, 0 % de duplication |
| Trivy (image) | 0 CRITICAL ; 1 HIGH non bloquant (`deepmerge-ts`) |
| Ansible | `ok=24 changed=0 failed=0` au second passage, sur la VM réelle |
| Déploiement | Staging (4001) et production (4000) `READY` / `CONNECTED`, conteneurs `healthy` |
| Rollback | Staging revenu en `1.0.0`, donnée conservée |

## Écarts au cahier des charges

QEMU/KVM au lieu de VMware (poste Linux, pas d'ESXi/vCenter) ; Ubuntu 22.04 Desktop au lieu de Server 24.04 (ISO fournie) ; Terraform limité à l'inventaire (variante vSphere documentée) ;
runner GitLab local (la VM est sur une adresse privée).

## Limites

Migrations non rejouées en rollback (règles de rétro-compatibilité documentées) ; Docker contourne UFW pour les ports publiés ; staging et production sur la même VM ;
disque de la machine de travail proche du seuil de SonarQube ; déclenchement de Jenkins par interrogation, faute de webhook.

## Problèmes rencontrés

Quatorze problèmes diagnostiqués et corrigés (disque saturé, droits de tokens Docker Hub, clé SSH, runners partagés, variables GitLab protégées ou mal limitées, etc.) :
tableau détaillé dans le rapport en ligne et dans `deploiement/README.md`.

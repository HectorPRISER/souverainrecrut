#!/usr/bin/env bash
# Crée le Quality Gate "SouverainRecrut" dans SonarQube et l'affecte au projet.
# Usage : SONAR_URL=http://localhost:9000 SONAR_TOKEN=<token admin> ./setup-quality-gate.sh
set -euo pipefail

SONAR_URL="${SONAR_URL:-http://localhost:9000}"
: "${SONAR_TOKEN:?SONAR_TOKEN requis}"
PROJECT_KEY="${PROJECT_KEY:-souverainrecrut-backend}"
GATE="SouverainRecrut"

api() { curl -fsS -u "${SONAR_TOKEN}:" -X POST "${SONAR_URL}/api/$1" "${@:2}"; }

# Projet (idempotent)
api projects/create -d "project=${PROJECT_KEY}" -d "name=SouverainRecrut Backend" >/dev/null 2>&1 || true

# Gate (idempotent : on recrée les conditions)
api qualitygates/destroy -d "name=${GATE}" >/dev/null 2>&1 || true
api qualitygates/create -d "name=${GATE}" >/dev/null

# Un nouveau gate est créé avec des conditions par défaut : on les supprime pour définir les nôtres
for id in $(curl -fsS -u "${SONAR_TOKEN}:" "${SONAR_URL}/api/qualitygates/show?name=${GATE}" | grep -o '"id":"[^"]*"' | cut -d'"' -f4); do
  api qualitygates/delete_condition -d "id=${id}" >/dev/null
done

cond() { api qualitygates/create_condition -d "gateName=${GATE}" -d "metric=$1" -d "op=$2" -d "error=$3" >/dev/null; }
cond new_coverage                  LT 80   # couverture du code neuf >= 80 %
cond coverage                      LT 90   # couverture globale >= 90 % (objectif : couverture maximale)
cond new_vulnerabilities           GT 0    # aucune vulnérabilité sur code neuf
cond new_security_hotspots_reviewed LT 100 # hotspots revus
cond new_duplicated_lines_density  GT 3    # duplications < 3 %
cond duplicated_lines_density     GT 3    # duplications globales < 3 %
cond new_bugs                      GT 0    # aucun bug sur code neuf

api qualitygates/select -d "gateName=${GATE}" -d "projectKey=${PROJECT_KEY}" >/dev/null
echo "Quality Gate '${GATE}' appliqué au projet ${PROJECT_KEY}."

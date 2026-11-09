# Jenkins LTS + outils du pipeline (Node 22, Docker CLI, sonar-scanner, Trivy).
FROM jenkins/jenkins:2.580.2-lts-jdk21

USER root

ARG NODE_VERSION=22.16.0
ARG DOCKER_VERSION=28.0.4
ARG SONAR_SCANNER_VERSION=6.2.1.4610

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates xz-utils unzip jq postgresql-client \
 && rm -rf /var/lib/apt/lists/*

# Node.js
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
  | tar -xJ -C /usr/local --strip-components=1

# Docker CLI (le démon est celui de l'hôte, via /var/run/docker.sock)
RUN curl -fsSL "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VERSION}.tgz" \
  | tar -xz -C /usr/local/bin --strip-components=1 docker/docker

# SonarScanner CLI (JRE embarqué)
RUN curl -fsSL -o /tmp/scanner.zip \
      "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip" \
 && unzip -q /tmp/scanner.zip -d /opt && rm /tmp/scanner.zip \
 && ln -s /opt/sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64/bin/sonar-scanner /usr/local/bin/sonar-scanner

# Trivy : binaire copié depuis l'image officielle (version fixée)
COPY --from=aquasec/trivy:0.58.1 /usr/local/bin/trivy /usr/local/bin/trivy

ENV TRIVY_CACHE_DIR=/var/jenkins_home/.cache/trivy \
    CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/casc.yaml \
    JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY casc.yaml /usr/share/jenkins/ref/casc.yaml

# Exécuté en root pour accéder à /var/run/docker.sock (environnement de TP local uniquement)
USER root

# Postgres 17 (mesma versão principal do Netlify DB) com a extensão pgTAP,
# usada só pelos testes de banco (serviço dbtest).
FROM postgres:17
RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-17-pgtap \
 && rm -rf /var/lib/apt/lists/*

# Netlify CLI (netlify dev): Angular + Functions + redirects num só endereço.
FROM node:26-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*
# ipv4first: o netlify dev conecta nas functions por 127.0.0.1, mas elas escutam em
# "localhost", que no container resolveria para ::1 e recusaria a conexão.
ENV NG_CLI_ANALYTICS=false \
    NETLIFY_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--dns-result-order=ipv4first
# Roda com o UID/GID de quem usa o repositório (APP_UID/APP_GID no .env), para que o
# que o netlify dev e o ng gravam no bind mount (.netlify/, web/dist/) não fique com
# dono root no host. As pastas dos volumes nascem com esse dono: o Docker copia a
# permissão da imagem quando cria um volume vazio.
ARG APP_UID=1000
ARG APP_GID=1000
ENV HOME=/tmp/home
RUN mkdir -p /app/node_modules /app/web/node_modules /app/web/.angular /tmp/home \
 && chown -R "$APP_UID:$APP_GID" /app /tmp/home
WORKDIR /app
COPY docker/app/entrypoint.sh /usr/local/bin/entrypoint.sh
USER ${APP_UID}:${APP_GID}
ENTRYPOINT ["entrypoint.sh"]
CMD ["npx", "netlify", "dev", "--offline"]

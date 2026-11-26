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
WORKDIR /app
COPY docker/app/entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
CMD ["npx", "netlify", "dev", "--offline"]

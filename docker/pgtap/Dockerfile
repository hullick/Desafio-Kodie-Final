# Runner dos testes de banco: psql + pg_prove contra o serviço db.
FROM postgres:17
RUN apt-get update \
 && apt-get install -y --no-install-recommends libtap-parser-sourcehandler-pgtap-perl \
 && rm -rf /var/lib/apt/lists/*
COPY docker/migrate/migrate.sh /usr/local/bin/migrate.sh
COPY docker/pgtap/run.sh /usr/local/bin/run-dbtest.sh
ENTRYPOINT ["run-dbtest.sh"]

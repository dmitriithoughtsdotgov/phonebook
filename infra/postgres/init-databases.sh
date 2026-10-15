#!/bin/sh
# Runs once, on the first start of an empty Postgres volume.
# Creates separate databases and users for Keycloak and for the application.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
	CREATE USER "$KEYCLOAK_DB_USER" WITH PASSWORD '$KEYCLOAK_DB_PASSWORD';
	CREATE DATABASE "$KEYCLOAK_DB" OWNER "$KEYCLOAK_DB_USER";

	CREATE USER "$APP_DB_USER" WITH PASSWORD '$APP_DB_PASSWORD';
	CREATE DATABASE "$APP_DB" OWNER "$APP_DB_USER";
EOSQL

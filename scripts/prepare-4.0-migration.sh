#! /bin/bash

_ENV=${NODE_ENV:-development}
_CONFIG="config.${_ENV}.json"
CONFIG=$(cat $_CONFIG)

MYSQL_DATABASES=$(echo "$CONFIG" | jq 'if .hostMatching then .hostMatching.hosts | .[] else null end' | xargs)

SQL='ALTER TABLE migrations RENAME TO knex_migrator_migrations; ALTER TABLE migrations_lock RENAME TO knex_migrator_migrations_lock;'

run_mysql_migration() {
	HOST=$(echo "$CONFIG" | jq -r .database.connection.host)
	USER=$(echo "$CONFIG" | jq -r .database.connection.user)
	PASS=$(echo "$CONFIG" | jq -r .database.connection.password)

	DATABASES=($(echo "$MYSQL_DATABASES" | tr " " "\n"))
	for DATABASE in ${DATABASES[@]}; do
		mysql -h $HOST -u $USER -p$PASS -e "USE $DATABASE; $SQL"
	done
}

run_sqlite3_migration() {
	DATABASE=$(echo "$CONFIG" | jq -r .database.connection.filename)
	if [[ "$DATABASE" == "null" ]]; then
		DATABASE=$(echo "content/database.db")
	fi

	sqlite3 "$DATABASE" "$SQL"
}

# CASE: NO Host Matching
if [[ "$MYSQL_DATABASES" == "null" ]]; then
	DATABASE_TYPE=$(echo "$CONFIG" | jq -r .database.client)

	# CASE: mysql -> set single database and run multi-migration
	if [[ "$DATABASE_TYPE" == "mysql" ]]; then
		MYSQL_DATABASES=$(echo "$CONFIG" | jq .database.connection.database)
	# CASE: sqlite3 -> run single migration
	else
		run_sqlite3_migration
		exit
	fi
fi

if [[ "$MYSQL_DATABASES" != "null" ]]; then
	run_mysql_migration
fi

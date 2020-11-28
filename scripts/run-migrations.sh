#! /bin/bash

_ENV=${NODE_ENV:-development}
_CONFIG="config.${_ENV}.json"
CONFIG=$(cat $_CONFIG)

MYSQL_DATABASES=$(echo "$CONFIG" | jq 'if .hostMatching then .hostMatching.hosts | .[] else null end' | xargs)

run_mysql_migration() {
	echo "run_mysql_migration"

	DATABASES=($(echo "$MYSQL_DATABASES" | tr " " "\n"))
	for DATABASE_ in ${DATABASES[@]}; do
		echo $DATABASE_
		NODE_ENV=$(echo $_ENV) DATABASE=$(echo $DATABASE_) yarn knex migrate:latest
	done
}

# CASE: NO Host Matching
if [[ "$MYSQL_DATABASES" == "null" ]]; then
	DATABASE_TYPE=$(echo "$CONFIG" | jq -r .database.client)

	# CASE: mysql -> set single database and run multi-migration
	if [[ "$DATABASE_TYPE" == "mysql" ]]; then
		MYSQL_DATABASES=$(echo "$CONFIG" | jq -r .database.connection.database)
	# CASE: sqlite3 -> run single migration
	else
		NODE_ENV=$(echo $_ENV) yarn knex migrate:latest
		exit
	fi
fi

if [[ "$MYSQL_DATABASES" != "null" ]]; then
	run_mysql_migration
fi

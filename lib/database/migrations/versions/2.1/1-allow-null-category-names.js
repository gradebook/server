const log = require('../../../../logging');

const TABLE_NAME = 'categories';

exports.up = ({connection}) => {
	log.info('Allowing categories.name to be null');
	const migrationIsNotSupported = connection.client.config.client === 'sqlite3';

	if (migrationIsNotSupported) {
		log.error('Cannot run migration in sqlite, recreate table or make categories.name nullable manually');
		return;
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		log.info('categories.name is nullable');
		table.string('name').nullable().alter();
	});
};

exports.down = ({connection}) => {
	log.info('Disallowing categories.name to be null');

	const migrationIsNotSupported = connection.client.config.client === 'sqlite3';

	if (migrationIsNotSupported) {
		log.error('Cannot run migration in sqlite, recreate table or make categories.name not nullable manually');
		return;
	}

	return connection.schema.alterTable(TABLE_NAME, table => {
		log.info('categories.name is not nullable');
		table.string('name').notNullable().alter();
	});
};

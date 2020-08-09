const config = require('./lib/config');
const envConfig = {
	...config.get('database'),
	migrations: {
		tableName: 'migrations',
		directory: './lib/database/migrations'
	}
};

if (process.env.DATABASE) {
	envConfig.connection.database = process.env.DATABASE;
}

module.exports = {
	[config.get('env')]: envConfig
};

const config = require('./lib/config');
const envConfig = {
	...config.get('database'),
	migrations: {
		tableName: 'migrations',
		directory: './lib/database/migrations'
	},
	logging: {
		level: 'info',
		rotation: {
			enabled: false
		},
		path: './logs/migrations',
		domain: 'gb-mg',
		transports: ['file', 'stdout']
	}
};

if (process.env.DATABASE) {
	envConfig.connection.database = process.env.DATABASE;
}

module.exports = {
	[config.get('env')]: envConfig
};

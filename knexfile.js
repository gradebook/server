const config = require('./lib/config');
config.set('logging', {
	level: 'info',
	rotation: {
		enabled: false
	},
	path: './logs/migrations',
	domain: 'gb-mg',
	transports: ['file', 'stdout']
});

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

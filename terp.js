const databases = ['aggie', 'clemson', 'comet', 'raider', 'husker', 'longhorn'];

console.log(`CREATE USER 'agb' IDENTIFIED BY 'safe';`);

for (const database of databases) {
	console.log(`CREATE DATABASE ${database};
GRANT ALL PRIVILEGES ON ${database}.* TO agb;`);
}

console.log('FLUSH PRIVILEGES;');

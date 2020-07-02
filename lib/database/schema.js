const ID_MAXLEN = 24;
/* eslint-disable camelcase */
module.exports = {
	users: {
		id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, primary: true, unique: true},
		gid: {type: 'string', maxLength: 255, nullable: false, unique: true},
		first_name: {type: 'string', maxLength: 100, nullable: false},
		last_name: {type: 'string', maxLength: 100, nullable: true},
		email: {type: 'string', maxLength: 255, nullable: false},
		created_at: {type: 'datetime', nullable: false},
		updated_at: {type: 'datetime', nullable: false},
		settings: {type: 'text', maxLength: 10000, defaultTo: '{}'}
	},
	courses: {
		id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, primary: true, unique: true},
		user_id: {type: 'string', maxLength: ID_MAXLEN, nullable: false},
		semester: {type: 'string', maxLength: 5, nullable: false},
		name: {type: 'string', maxLength: 100, nullable: false},
		cut1: {type: 'float', nullable: false, defaultTo: 90},
		cut2: {type: 'float', nullable: false, defaultTo: 80},
		cut3: {type: 'float', nullable: false, defaultTo: 70},
		cut4: {type: 'float', nullable: false, defaultTo: 60},
		cut1Name: {type: 'string', nullable: false, defaultTo: 'A', maxLength: 5},
		cut2Name: {type: 'string', nullable: false, defaultTo: 'B', maxLength: 5},
		cut3Name: {type: 'string', nullable: false, defaultTo: 'C', maxLength: 5},
		cut4Name: {type: 'string', nullable: false, defaultTo: 'D', maxLength: 5},
		credit_hours: {type: 'tinyint', nullable: true, defaultTo: null, unsigned: true}
	},
	categories: {
		id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, primary: true, unique: true},
		course_id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, references: 'courses.id'},
		name: {type: 'string', maxLength: 50, nullable: true},
		weight: {type: 'float', nullable: true},
		position: {type: 'integer', nullable: true},
		dropped_grades: {type: 'tinyint', nullable: true, defaultTo: null, unsigned: true}
	},
	grades: {
		id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, primary: true, unique: true},
		user_id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, references: 'users.id'},
		course_id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, references: 'courses.id'},
		category_id: {type: 'string', maxLength: ID_MAXLEN, nullable: false, references: 'categories.id'},
		name: {type: 'string', maxLength: 50, nullable: true},
		grade: {type: 'float', nullable: true}
	},
	// Used by express-session / connect-session-knex
	sessions: {
		sessionAGB: {type: 'string', maxLength: 255, nullable: false, primary: true},
		sess: {type: 'json', nullable: false},
		expired: {type: 'timestamp', nullable: false, index: true}
	},
	settings: {
		key: {type: 'string', maxLength: 32, nullable: false, unique: true, primary: true},
		value: {type: 'string', maxLength: 191, nullable: false}
	},
	actions: {
		type: {type: 'string', maxLength: 32, nullable: false},
		timestamp: {type: 'timestamp', nullable: false},
		data: {type: 'text', nullable: false}
	},
	statistics: {
		date: {type: 'date', primary: true, nullable: false},
		totalUsers: {type: 'integer', nullable: false},
		newUsers: {type: 'integer', nullable: false},
		totalCourses: {type: 'integer', nullable: false},
		totalCategories: {type: 'integer', nullable: false},
		totalGrades: {type: 'integer', nullable: false},
		deletedCourses: {type: 'integer', nullable: false},
		deletedCategories: {type: 'integer', nullable: false},
		newUsersLastWeek: {type: 'integer', nullable: false},
		deletedUsers: {type: 'integer', nullable: false},
		accessed: {type: 'integer', nullable: false},
		accessedLastWeek: {type: 'integer', nullable: false},
		categoriesUsed: {type: 'integer', nullable: false}
	}
};

/* eslint-enable camelcase */

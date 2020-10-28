// @ts-check
const ID_MAX_LEN = 24;
/* eslint-disable camelcase */
/**
 * @type {{[table: string]: import('./schema.d').TableSchema}}
 */
const schema = {
	users: {
		id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, primary: true, unique: true},
		gid: {type: 'string', maxLength: 255, nullable: false, unique: true},
		first_name: {type: 'string', maxLength: 100, nullable: false},
		last_name: {type: 'string', maxLength: 100, nullable: true},
		email: {type: 'string', maxLength: 255, nullable: false},
		created_at: {type: 'datetime', nullable: false},
		updated_at: {type: 'datetime', nullable: false},
		settings: {type: 'text', fallback: '{}', validations: {maxLength: 10000}},
		donated_at: {type: 'datetime', nullable: true, fallback: null},
		total_school_changes: {type: 'tinyint', nullable: true, fallback: 0, unsigned: true, validations: {between: [0, 5]}}
	},
	courses: {
		id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, primary: true, unique: true},
		user_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false},
		semester: {type: 'string', maxLength: 5, nullable: false},
		name: {type: 'string', maxLength: 100, nullable: false},
		cutoffs: {type: 'text', subType: 'tinytext', nullable: false, validations: {maxLength: 200}},
		credit_hours: {type: 'tinyint', nullable: true, fallback: null, unsigned: true, validations: {between: [0, 5]}}
	},
	categories: {
		id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, primary: true, unique: true},
		course_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'courses.id'},
		name: {type: 'string', maxLength: 50, nullable: true},
		weight: {type: 'float', nullable: true, validations: {between: [0, 10000]}},
		position: {type: 'integer', nullable: true, validations: {between: [0, 50000]}},
		dropped_grades: {type: 'tinyint', nullable: true, fallback: null, unsigned: true, validations: {between: [1, 40]}}
	},
	grades: {
		id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, primary: true, unique: true},
		user_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'users.id'},
		course_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'courses.id'},
		category_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'categories.id'},
		name: {type: 'string', maxLength: 55, nullable: true},
		grade: {type: 'float', nullable: true, validations: {between: [0, 999999]}}
	},
	// Used by express-session / connect-session-knex
	sessions: {
		sessionAGB: {type: 'string', maxLength: 255, nullable: false, primary: true, unique: true},
		sess: {type: 'text', subType: 'json', nullable: false},
		expired: {type: 'timestamp', nullable: false, index: true}
	},
	settings: {
		key: {type: 'string', maxLength: 32, nullable: false, unique: true, primary: true},
		value: {type: 'string', maxLength: 191, nullable: false}
	},
	actions: {
		type: {type: 'string', maxLength: 32, nullable: false},
		timestamp: {type: 'timestamp', nullable: false},
		data: {type: 'text', subType: 'tinytext', nullable: false}
	},
	statistics: {
		date: {type: 'date', primary: true, unique: true, nullable: false},
		totalUsers: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		newUsers: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		totalCourses: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		totalCategories: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		totalGrades: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		deletedCourses: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		deletedCategories: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		newUsersLastWeek: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		deletedUsers: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		accessedLastWeek: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}},
		categoriesUsed: {type: 'integer', nullable: false, validations: {between: [0, 100000000]}}
	}
};

/* eslint-enable camelcase */
module.exports = schema;

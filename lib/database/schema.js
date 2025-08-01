// @ts-check
import {MAX_CREDITS_IN_COURSE} from '../services/validation/schema-loader.js';

// @ts-check
const ID_MAX_LEN = 24;
/* eslint-disable camelcase, object-curly-newline */
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
		settings: {type: 'json', fallback: '{"gpa":{}}', validations: {maxLength: 10_000}},
		donated_at: {type: 'datetime', nullable: true, fallback: null},
		total_school_changes: {type: 'tinyint', nullable: true, fallback: 0, unsigned: true, validations: {between: [0, 5]}},
	},
	courses: {
		id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, primary: true, unique: true},
		user_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'users.id'},
		semester: {type: 'string', maxLength: 5, nullable: false},
		name: {type: 'string', maxLength: 100, nullable: false},
		cutoffs: {type: 'text', subType: 'tinytext', nullable: false, validations: {maxLength: 200}},
		credit_hours: {type: 'float', nullable: false, validations: {between: [0, MAX_CREDITS_IN_COURSE]}},
		settings: {type: 'json', fallback: '{}', validations: {maxLength: 10_000}},
	},
	categories: {
		id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, primary: true, unique: true},
		course_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'courses.id'},
		name: {type: 'string', maxLength: 50, nullable: true},
		weight: {type: 'float', nullable: true, validations: {between: [0, 10_000]}},
		position: {type: 'integer', nullable: true, validations: {between: [0, 50_000]}},
		dropped_grades: {type: 'tinyint', nullable: true, fallback: null, unsigned: true, validations: {between: [1, 40]}},
	},
	grades: {
		id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, primary: true, unique: true},
		user_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'users.id'},
		course_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'courses.id'},
		category_id: {type: 'string', maxLength: ID_MAX_LEN, nullable: false, references: 'categories.id'},
		name: {type: 'string', maxLength: 55, nullable: true},
		grade: {type: 'float', nullable: true, validations: {between: [0, 999_999]}},
	},
	// Used by express-session / connect-session-knex
	sessions: {
		sessionAGB: {type: 'string', maxLength: 255, nullable: false, primary: true, unique: true},
		sess: {type: 'json', nullable: false, validations: {maxLength: 1_000_000}},
		expired: {type: 'timestamp', nullable: false, index: true},
	},
	settings: {
		key: {type: 'string', maxLength: 32, nullable: false, unique: true, primary: true},
		value: {type: 'string', maxLength: 191, nullable: false},
	},
	actions: {
		type: {type: 'string', maxLength: 32, nullable: false},
		timestamp: {type: 'timestamp', nullable: false},
		data: {type: 'text', subType: 'tinytext', nullable: false},
	},
	statistics: {
		date: {type: 'date', primary: true, unique: true, nullable: false},
		totalUsers: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		newUsers: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		totalCourses: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		totalCategories: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		totalGrades: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		deletedCourses: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		deletedCategories: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		newUsersLastWeek: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		deletedUsers: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		accessedLastWeek: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
		categoriesUsed: {type: 'integer', nullable: false, validations: {between: [0, 100_000_000]}},
	},
};
/* eslint-enable camelcase, object-curly-newline */
export default schema;

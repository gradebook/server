const VALID_COURSE_NAME = /[A-Z]{3,4} \d{3,4}/;
const errors = require('../../errors');

module.exports.validateList = (list, data) => {
	for (const constraint of list) {
		const {key, validate} = constraint;
		if (!(key in data && ![null, undefined, ''].includes(data[key]))) {
			continue;
		}

		if (!validate(data[key])) {
			throw new errors.ValidationError({context: [`Invalid ${key}`]});
		}
	}
};

module.exports.list = {
	weight: {
		key: 'weight',
		validate: value => value >= 1 && value <= 10000
	},
	cut(letter) {
		return {
			key: `cut${letter.toUpperCase()}`,
			validate: value => value >= 10 && value <= 10000
		}
	},
	courseName: {
		key: 'name',
		validate: name => VALID_COURSE_NAME.test(name)
	}
};

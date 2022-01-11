// @ts-check
const fs = require('fs/promises');
const isProd = require('../../utils/is-production.js');
const settingsService = require('../settings/index.js');

const MAX_GRADE_NAME_SIZE = 55;
const MAX_CATEGORY_NAME_SIZE = 50;
const MAX_CREDITS_IN_COURSE = 9;
const MAX_BATCH_SIZE = 100; // @todo - this should be able to be lowered to max_grades_per_category?

module.exports.MAX_CREDITS_IN_COURSE = MAX_CREDITS_IN_COURSE;

const loadReplacements = () => {
	const MAX_DROPPED_GRADES = Number(settingsService.get('max_grades_per_category')) - 1;
	return {
		partialCourseMeta: {
			'properties.credits.maximum': MAX_CREDITS_IN_COURSE,
		},
		batchEdit: {
			'properties.create.maxItems': MAX_BATCH_SIZE,
			'properties.update.maxItems': MAX_BATCH_SIZE,
			'properties.delete.maxItems': MAX_BATCH_SIZE,
			'properties.create.items.properties.name.maxLength': MAX_GRADE_NAME_SIZE,
			'properties.update.items.properties.name.maxLength': MAX_GRADE_NAME_SIZE,
		},
		createCategory: {
			'properties.dropped.anyOf.0.maximum': MAX_DROPPED_GRADES,
			'properties.name.maxLength': MAX_CATEGORY_NAME_SIZE,
		},
		partialCatBatch: {
			'items.properties.name.maxLength': MAX_CATEGORY_NAME_SIZE,
		},
		createGrade: {
			'properties.name.maxLength': MAX_GRADE_NAME_SIZE,
		},
		editCourse: {
			'properties.credits.maximum': MAX_CREDITS_IN_COURSE,
		},
		editCategory: {
			'properties.name.maxLength': MAX_CATEGORY_NAME_SIZE,
			'properties.dropped.anyOf.0.maximum': MAX_DROPPED_GRADES,
		},
		editGrade: {
			'properties.name.maxLength': MAX_GRADE_NAME_SIZE,
		},
		none: {},
	};
};

/**
 * @param {Record<string, any>} source
 * @param {string} tree
 * @param {string | number} value
 */
function replaceWithDebug(source, tree, value) {
	let pointer = source;
	const nodes = tree.split('.');
	const lastKey = nodes.pop();
	let completed = false;

	const walkTree = () => {
		const next = nodes.shift();
		if (!next) {
			return true;
		}

		if (typeof pointer !== 'object') {
			throw new TypeError(
				`SchemaLoader: ${tree} is not a valid path - cannot read "${next}" of ${typeof pointer}`,
			);
		}

		pointer = pointer[next];

		if (!pointer) {
			throw new TypeError(
				`SchemaLoader: ${tree} is not a valid path - "${next}" does not exist.`,
			);
		}

		return false;
	};

	while (!completed) {
		completed = walkTree();
	}

	if (pointer[lastKey] !== -999 && pointer[lastKey] !== 999 && pointer[lastKey] !== '{{variable}}') {
		throw new Error(`SchemaLoader: ${tree} has an unreplaceable value (${pointer[lastKey]})`);
	}

	pointer[lastKey] = value;
}

/**
 * @param {Record<string, unknown>} source
 * @param {string} context
 */
function assertNoUnexpectedValues(source, context, remainingDepth = 8, tree = '') {
	if (remainingDepth === 0) {
		throw new Error('SchemaLoader: assertion failed - max depth reached');
	}

	for (const [key, value] of Object.entries(source)) {
		if (typeof value === 'number') {
			if (value === -999 || value === 999) {
				throw new Error(`${tree}.${key} contains a replacement value (${value}) in ${context}`);
			}
		} else if (typeof value === 'string') {
			if (value === '{{variable}}') {
				throw new Error(`${tree}.${key} contains a replacement value (${value}) in ${context}`);
			}
		} else if (typeof value === 'boolean') {
			continue;
		} else if (Array.isArray(value)) {
			for (const [index, child] of value.entries()) {
				assertNoUnexpectedValues(child, context, remainingDepth - 1, `${tree}.${key}[${index}]`);
			}
		} else {
			// @ts-expect-error
			assertNoUnexpectedValues(value, context, remainingDepth - 1, `${tree}.${key}`);
		}
	}
}

/**
 * @param {Record<string, any>} source
 * @param {string} tree
 * @param {string | number} value
 */
function replace(source, tree, value) {
	let pointer = source;
	const nodes = tree.split('.');
	const lastKey = nodes.pop();
	let completed = false;

	const walkTree = () => {
		const next = nodes.shift();
		if (!next) {
			return true;
		}

		pointer = pointer[next];
		return false;
	};

	while (!completed) {
		completed = walkTree();
	}

	pointer[lastKey] = value;
}

const replacer = isProd ? replace : replaceWithDebug;

/**
 * @param {string} relativePath
 * @param {NodeRequire} yourRequire
 * @param {keyof ReturnType<typeof loadReplacements>} [replacementKey]
 */
module.exports.loadSchema = async function loadSchema(relativePath, yourRequire, replacementKey = 'none') {
	const replacements = loadReplacements();
	const absolutePath = yourRequire.resolve(relativePath);
	const schema = JSON.parse(await fs.readFile(absolutePath, 'utf-8'));

	for (const [tree, replacement] of Object.entries(replacements[replacementKey])) {
		replacer(schema, tree, replacement);
	}

	if (!isProd) {
		assertNoUnexpectedValues(schema, absolutePath.replace(process.cwd(), '.'));
	}

	return schema;
};

const BASE_USER_PATH = '../content/user-data/';
const {resolve} = require('path');
const api = require('../lib/api');
const {readFile, readdir} = require('../lib/utils/fs');
const errors = require('../lib/errors');
const {category: {create: CategoryModel}, grade: {create: GradeModel}} = require('../lib/models');

let fail = 0;
let pass = 0;
let info = [];

const skipList = [];

async function insertUser(relFileName) {
	if (skipList.includes(relFileName)) {
		info.push({file: relFileName, msg: 'skipped'});
		return;
	}

	const fileName = resolve(__dirname, BASE_USER_PATH, relFileName);
	let userExport;

	try {
		const contents = await readFile(fileName, 'utf8');
		userExport = JSON.parse(contents);
	} catch (error) {
		++fail;
		console.log(error);
		throw new errors.InternalServerError({err: 'Failed loading data'});
	}

	const txn = await api.getTransaction();

	try {
		const user = await api.user.create({
			gid: relFileName.split('.json')[0].split('\\').pop(),
			firstName: userExport.user.firstName,
			lastName: userExport.user.lastName,
			email: userExport.user.email,
			created_at: userExport.user.created_at.replace('.000Z', ''),
			isNew: false,
			// https://github.com/tgriesser/knex/issues/2649
			settings: '{}'
		}, txn);
		const userID = user.id;

		for (const course of userExport.courses) {
			if (!course.semester) {
				info.push({file: relFileName, msg: 'no semester'});
				continue;
			}

			if (!course.name) {
				course.name = '(Untitled Course)';
			}

			const {categories} = course;
			delete course.categories;
			course.user_id = userID;

			const createdCourse = await api.course.create(course, txn);

			for (const category of categories) {
				if (!category.name) {
					category.name = "(Untitled Category)"
				}

				const newCat = new CategoryModel();
				newCat.set('course_id', createdCourse.id);

				for (const key in category) {
					newCat.set(key, category[key]);
				}

				await newCat.commit(txn);

				const catID = newCat.json.id;

				for (const grade of category.grades) {
					const newGrade = new GradeModel();

					newGrade.set('course_id', createdCourse.id);
					newGrade.set('category_id', catID);
					newGrade.set('user_id', userID);

					for (const key in grade) {
						newGrade.set(key, grade[key]);
					}

					await newGrade.commit(txn);
				}
			}
		}

		await txn.commit();
		++pass
	} catch (error) {
		++fail;
		console.log(error);
		throw error;
	}
};

async function run() {
	const files = await readdir(resolve(__dirname, BASE_USER_PATH));

	for (const file of files) {
		console.log('next');
		if (file.match(/\.json$/)) {
			try {
				await insertUser(file);
			} catch (error) {
				console.log(file, 'failed');
				throw error;
			}
		}
	}
}

async function tryCatch() {
	try {
		await run();
	} finally {
		console.log('Fail:', fail, ',Pass:', pass);
		console.log(JSON.stringify(info, null, 2));
	}
}

tryCatch();

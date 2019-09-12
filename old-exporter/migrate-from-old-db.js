const SEMESTER_MAP = [null, '2018U', '2018F', '2019S', '2019U'];
const Progress = require('./node-progress');
const {promises: fs} = require('fs');
const ROOT_OUTPUT_DIR = './user-data';

// classNames unique on user_id + semester + class_id

const createKnex = require('knex');
const knex = createKnex({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    database: 'agb'
  }
});

async function migrateUser(id) {
	const user = await knex('googleusers').select('*').where({id}).first();
	const courses = await knex('gclassnames').where({user_id: id}).select();

	for (const course of courses) {
		course.categories = [];
		const cats = await knex('gdatastore').where({semester: course.semester, user_id: id, class_id: course.class_id});
		for (const cat of cats) {
			if (cat.subrows) {
				const grades = await knex('gsubdatastore').where({
					user_id: id,
					sem: course.semester,
					class: course.class_id,
					row: cat.row_id
				});

				course.categories.push({
					name: cat.item,
					weight: cat.weight,
					grades: grades.map(grade => {
						return {
							name: grade.name,
							grade: grade.grade,
							position: grade.subrow
						}
					})
				});
			} else {
				course.categories.push({
					name: cat.item,
					weight: cat.weight,
					grades: [
						{name: null, grade: cat.grade}
					]
				});
			}
		}

		course.semester = SEMESTER_MAP[Number(course.semester)];
		course.cutA = course.cut_a;
		course.cutB = course.cut_b;
		course.cutC = course.cut_c;
		course.cutD = course.cut_d;
		course.name = course.class_name;

		delete course.cut_a;
		delete course.cut_b;
		delete course.cut_c;
		delete course.cut_d;
		delete course.user_id;
		delete course.class_id;
		delete course.class_name;
	}

	const data = {
		user: {
			firstName: user.first_name,
			lastName: user.last_name,
			email: user.email,
			created_at: user.created,
			updated_at: user.modified
		},
		courses
	};

	await fs.writeFile(ROOT_OUTPUT_DIR + `/${user.oauth_uid}.json`, JSON.stringify(data));
}

async function run() {
	try {
		const users = await knex('googleusers').select('id');
		const bar = new Progress('[:bar] :percent :current/:total', {total: users.length, width: 70});
		for (const user of users) {
			await migrateUser(user.id);
			bar.tick();
		}
	} finally {
		knex.destroy();
	}
}

run();


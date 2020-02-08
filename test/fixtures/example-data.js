/* eslint-disable camelcase, unicorn/no-zero-fractions */
const fixtures = [
	['users', {id: '5d3c8150930db248a9d7514f', gid: 0, firstName: 'Trusted', lastName: 'User', email: 'trusted@aggiegradebook.com', created_at: '2019-01-01', updated_at: '2019-01-01', settings: '{}'}],
	['users', {id: '5d3c81a099e3d8f91f66967c', gid: 1, firstName: 'Evil', lastName: 'User', email: 'evil@aggiegradebook.com', created_at: '2019-01-01', updated_at: '2019-01-01', settings: '{}'}],
	['users', {id: '5d3c81b49d866268d230e180', gid: 2, firstName: 'Confused', lastName: 'User', email: 'confused@aggiegradebook.com', created_at: '2019-01-01', updated_at: '2019-01-01', settings: '{}'}],
	['users', {id: '5d3c81d738773f9ae92e8c7d', gid: 3, firstName: 'Random', lastName: 'User', email: 'random@aggiegradebook.com', created_at: '2019-01-01', updated_at: '2019-01-01', settings: '{}'}],
	['courses', {id: '5d3c81fbaf84df3df0a18c1b', user_id: '5d3c8150930db248a9d7514f', credit_hours: null, semester: '2019S', name: 'Course A', cut1: 90, cut1Name: 'A', cut2: 80, cut2Name: 'B', cut3: 70, cut3Name: 'C', cut4: 60, cut4Name: 'D', credit_hours: null}],
	['courses', {id: '5d3c8227faade0e6c7e0ed30', user_id: '5d3c8150930db248a9d7514f', credit_hours: null, semester: '2019S', name: 'Course B', cut1: 90, cut1Name: 'A', cut2: 80, cut2Name: 'B', cut3: 70, cut3Name: 'C', cut4: 60, cut4Name: 'D', credit_hours: null}],
	['courses', {id: '5d3c822b361ac86457c4395e', user_id: '5d3c8150930db248a9d7514f', credit_hours: null, semester: '2019S', name: 'Course C', cut1: 90, cut1Name: 'A', cut2: 80, cut2Name: 'B', cut3: 70, cut3Name: 'C', cut4: 60, cut4Name: 'D', credit_hours: null}],
	['courses', {id: '5d3c8230c95745a3e0806c9b', user_id: '5d3c8150930db248a9d7514f', credit_hours: null, semester: '2019S', name: 'Course D', cut1: 90, cut1Name: 'A', cut2: 80, cut2Name: 'B', cut3: 70, cut3Name: 'C', cut4: 60, cut4Name: 'D', credit_hours: null}],
	['courses', {id: '5d48437d8c01946f39ea997f', user_id: '5d3c8150930db248a9d7514f', credit_hours: null, semester: '2019S', name: 'Course No Grades', cut1: 90, cut1Name: 'A', cut2: 80, cut2Name: 'B', cut3: 70, cut3Name: 'C', cut4: 60, cut4Name: 'D', credit_hours: null}],
	['categories', {id: '5d3c828ed99534fd73f142c5', course_id: '5d3c81fbaf84df3df0a18c1b', dropped_grades: null, name: 'Homework', weight: 0.15, position: 1}],
	['categories', {id: '5d3c8292be185434819fe939', course_id: '5d3c81fbaf84df3df0a18c1b', dropped_grades: null, name: 'Test 1', weight: 0.20, position: 2}],
	['categories', {id: '5d3c82961fead145ac4e475e', course_id: '5d3c81fbaf84df3df0a18c1b', dropped_grades: null, name: 'Test 2', weight: 0.21, position: 3}],
	['categories', {id: '5d3c829dad5f9593fc7f14d3', course_id: '5d3c81fbaf84df3df0a18c1b', dropped_grades: null, name: 'Test 3', weight: 0.22, position: 4}],
	['categories', {id: '5d3c82a385d1fd7f2800688c', course_id: '5d3c81fbaf84df3df0a18c1b', dropped_grades: null, name: 'Test 4', weight: 0.22, position: 5}],
	['categories', {id: '5d3c9230227f72dc4787f245', course_id: '5d3c8227faade0e6c7e0ed30', dropped_grades: null, name: 'Labs', weight: 0.30, position: 1}],
	['categories', {id: '5d3c923a374d77443c80d43d', course_id: '5d3c8227faade0e6c7e0ed30', dropped_grades: null, name: 'Test 1', weight: 0.40, position: 2}],
	['categories', {id: '5d3c923e2da3b7b3c6bc2532', course_id: '5d3c8227faade0e6c7e0ed30', dropped_grades: null, name: 'Test 2', weight: 0.40, position: 3}],
	['categories', {id: '5d3c92425e51e141ad90ff8d', course_id: '5d3c822b361ac86457c4395e', dropped_grades: null, name: 'Participation', weight: 0.10, position: 1}],
	['categories', {id: '5d3c92466426f4f8e25f04cd', course_id: '5d3c822b361ac86457c4395e', dropped_grades: null, name: 'Quizzes', weight: 0.50, position: 2}],
	['categories', {id: '5d3c924c26491c2612b66c29', course_id: '5d3c822b361ac86457c4395e', dropped_grades: null, name: 'Final Exam', weight: 0.40, position: 3}],
	['categories', {id: '5d3c9251aa114f0a63992119', course_id: '5d3c8230c95745a3e0806c9b', dropped_grades: null, name: 'Paper 1', weight: 0.30, position: 1}],
	['categories', {id: '5d3c925602bd1dae4e44ba0f', course_id: '5d3c8230c95745a3e0806c9b', dropped_grades: null, name: 'Paper 2', weight: 0.35, position: 2}],
	['categories', {id: '5d3c925b3ff7c43c348498cd', course_id: '5d3c8230c95745a3e0806c9b', dropped_grades: null, name: 'Paper 3', weight: 0.35, position: 3}],
	['grades', {id: '5d3c8661f73a7d00b4f9d72d', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c828ed99534fd73f142c5', name: 'Homework 1', grade: 100}],
	['grades', {id: '5d3c8666e70cbefd85d2eb21', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c828ed99534fd73f142c5', name: 'Homework 2', grade: 0}],
	['grades', {id: '5d3c8669cd7298e6717ba4e5', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c828ed99534fd73f142c5', name: 'Homework 3', grade: 95}],
	['grades', {id: '5d3c866d76fc7ea97dd1de13', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c828ed99534fd73f142c5', name: 'Homework 4', grade: 99}],
	['grades', {id: '5d3c867197a3720b86fbb949', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c828ed99534fd73f142c5', name: 'Homework 5', grade: 67}],
	['grades', {id: '5d3c86757e602bb06fc1195e', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c8292be185434819fe939', name: null, grade: 83}],
	['grades', {id: '5d3c8678e99d27a10e49829f', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c82961fead145ac4e475e', name: null, grade: 98}],
	['grades', {id: '5d3c867da64ce99eb67128fb', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c829dad5f9593fc7f14d3', name: null, grade: 89}],
	['grades', {id: '5d3c86810cfd9b08e4b65f23', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c81fbaf84df3df0a18c1b', category_id: '5d3c82a385d1fd7f2800688c', name: null, grade: 92}],
	['grades', {id: '5d3c9464e99cf4129029b7f7', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c9230227f72dc4787f245', name: 'Lab 1', grade: 91}],
	['grades', {id: '5d3c9464e99cf4129029b7f8', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c9230227f72dc4787f245', name: 'Lab 2', grade: 74}],
	['grades', {id: '5d3c9464e99cf4129029b7f9', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c9230227f72dc4787f245', name: 'Lab 3', grade: 88}],
	['grades', {id: '5d3c9464e99cf4129029b7fa', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c9230227f72dc4787f245', name: 'Lab 4', grade: 92}],
	['grades', {id: '5d3c9464e99cf4129029b7fb', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c9230227f72dc4787f245', name: 'Lab 5', grade: 94}],
	['grades', {id: '5d3c9464e99cf4129029b7fc', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c9230227f72dc4787f245', name: 'Lab 6', grade: 81}],
	['grades', {id: '5d3c9464e99cf4129029b7fd', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c923a374d77443c80d43d', name: null, grade: 86}],
	['grades', {id: '5d3c9464e99cf4129029b7fe', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8227faade0e6c7e0ed30', category_id: '5d3c923e2da3b7b3c6bc2532', name: null, grade: 77}],
	['grades', {id: '5d3c9464e99cf4129029b7ff', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c822b361ac86457c4395e', category_id: '5d3c92425e51e141ad90ff8d', name: null, grade: 98}],
	['grades', {id: '5d3c9464e99cf4129029b800', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c822b361ac86457c4395e', category_id: '5d3c92466426f4f8e25f04cd', name: 'Quiz 1', grade: 100}],
	['grades', {id: '5d3c9464e99cf4129029b801', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c822b361ac86457c4395e', category_id: '5d3c92466426f4f8e25f04cd', name: 'Quiz 2', grade: 95}],
	['grades', {id: '5d3c9464e99cf4129029b802', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c822b361ac86457c4395e', category_id: '5d3c92466426f4f8e25f04cd', name: 'Quiz 3', grade: 88}],
	['grades', {id: '5d3c9464e99cf4129029b803', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c822b361ac86457c4395e', category_id: '5d3c92466426f4f8e25f04cd', name: 'Quiz 4', grade: 94}],
	['grades', {id: '5d3c9464e99cf4129029b804', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c822b361ac86457c4395e', category_id: '5d3c92466426f4f8e25f04cd', name: 'Quiz 5', grade: 100}],
	['grades', {id: '5d3c9464e99cf4129029b805', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c822b361ac86457c4395e', category_id: '5d3c924c26491c2612b66c29', name: null, grade: 83}],
	['grades', {id: '5d3c9464e99cf4129029b806', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8230c95745a3e0806c9b', category_id: '5d3c9251aa114f0a63992119', name: null, grade: 100}],
	['grades', {id: '5d3c9464e99cf4129029b807', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8230c95745a3e0806c9b', category_id: '5d3c925602bd1dae4e44ba0f', name: null, grade: 85}],
	['grades', {id: '5d3c94770e9b3305164bca58', user_id: '5d3c8150930db248a9d7514f', course_id: '5d3c8230c95745a3e0806c9b', category_id: '5d3c925b3ff7c43c348498cd', name: null, grade: 94}],
	['settings', {key: 'session_secret', value: 'abcdef123456'}],
	['sessions', {sessionAGB: 'trusted', expired: '3000-01-01T00:00:00.000Z', sess: '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"null:5d3c8150930db248a9d7514f"}}'}],
	['sessions', {sessionAGB: 'evil', expired: '3000-01-01T00:00:00.000Z', sess: '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"null:5d3c81a099e3d8f91f66967c"}}'}],
	['sessions', {sessionAGB: 'confused', expired: '3000-01-01T00:00:00.000Z', sess: '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"null:5d3c81b49d866268d230e180"}}'}],
	['sessions', {sessionAGB: 'random', expired: '3000-01-01T00:00:00.000Z', sess: '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":"null:5d3c81d738773f9ae92e8c7d"}}'}]
];
/* eslint-enable camelcase, unicorn/no-zero-fractions */

const fixturesMap = {
	get trustedUser() {
		return this.users[0];
	},

	get evilUser() {
		return this.users[1];
	},

	get confusedUser() {
		return this.users[2];
	},

	get randomUser() {
		return this.users[3];
	},

	get courseWithNoGrades() {
		return this.courses[4];
	},

	cookies: {
		trusted: 'agbsid=s%3Atrusted.6b1LMhvKUJrWJSZK0cjW5tonTdZLWeOxbYd0OcxtRsk',
		evil: 'agbsid=s%3Aevil.qsZUfy7k9UhrYWLHYqnt3SvqA08z5S1mu9/xdgj9qiM',
		confused: 'agbsid=s%3Aconfused.SXqp19eWUmQ3yZvBxxnUErE6zXzgPKjCYetL4Wxq8ow',
		random: 'agbsid=s%3Arandom.FkByk2JUbMsNulr7lM+YeprlnZ2B3+ZgAPq88QkyuzQ'
	}
};

for (const [table, data] of fixtures) {
	if (!fixturesMap[table]) {
		fixturesMap[table] = [];
	}

	fixturesMap[table].push(data);
}

module.exports = fixturesMap;
module.exports.fixtures = fixtures;

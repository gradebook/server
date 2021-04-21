module.exports = () => ({
	/** @type {'0'} */
	version: '0',
	courses: [{
		semester: '2000F',
		name: 'FIRST 101',
		cutoffs: '[{"name":"A","cutoff":90},{"name":"B","cutoff":80},{"name":"C","cutoff":70},{"name":"D","cutoff":60}]',
		settings: '{}',
		credits: 4,
		categories: [{
			name: 'Homework',
			weight: 15,
			position: 100,
			dropped: null,
			grades: [
				{name: 'Homework 1', grade: null},
				{name: 'Homework 2', grade: null},
				{name: 'Homework 3', grade: null},
				{name: 'Homework 4', grade: null},
				{name: 'Homework 5', grade: null},
				{name: 'Homework 6', grade: null},
				{name: 'Homework 7', grade: null},
				{name: 'Homework 8', grade: null},
				{name: 'Homework 9', grade: null},
				{name: 'Homework 10', grade: null},
				{name: 'Homework 11', grade: null},
				{name: 'Homework 12', grade: null},
				{name: 'Homework 13', grade: null},
				{name: 'Homework 14', grade: null}
			]
		},
		{
			name: 'Lab',
			weight: 50,
			position: 200,
			dropped: 1,
			grades: [
				{name: 'Lab 1', grade: null},
				{name: 'Lab 2', grade: null},
				{name: 'Lab 3', grade: null},
				{name: 'Lab 4', grade: null},
				{name: 'Lab 5', grade: null},
				{name: 'Lab 6', grade: null},
				{name: 'Lab 7', grade: null},
				{name: 'Lab 8', grade: null},
				{name: 'Lab 9', grade: null},
				{name: 'Lab 10', grade: null}
			]
		},
		{
			name: 'Exam 1',
			weight: 10,
			position: 300,
			dropped: null,
			grades: [
				{name: null, grade: null}
			]
		},
		{
			name: 'Final',
			weight: 25,
			position: 400,
			dropped: null,
			grades: [
				{name: null, grade: null}
			]
		}]
	},
	{
		semester: '2000W',
		name: 'WORK 110',
		cutoffs: '[{"name":"A","cutoff":90},{"name":"B","cutoff":80},{"name":"C","cutoff":70},{"name":"D","cutoff":60}]',
		settings: '{}',
		credits: 4,
		categories: [{
			name: 'Homework',
			weight: 15,
			position: 100,
			dropped: null,
			grades: [
				{name: 'Homework 1', grade: null},
				{name: 'Homework 2', grade: null},
				{name: 'Homework 3', grade: null},
				{name: 'Homework 4', grade: null},
				{name: 'Homework 5', grade: null},
				{name: 'Homework 6', grade: null},
				{name: 'Homework 7', grade: null},
				{name: 'Homework 8', grade: null},
				{name: 'Homework 9', grade: null},
				{name: 'Homework 10', grade: null},
				{name: 'Homework 11', grade: null},
				{name: 'Homework 12', grade: null},
				{name: 'Homework 13', grade: null},
				{name: 'Homework 14', grade: null}
			]
		},
		{
			name: 'Quizzes',
			weight: 15,
			position: 200,
			dropped: 3,
			grades: [
				{name: 'Quiz 1', grade: null},
				{name: 'Quiz 2', grade: null},
				{name: 'Quiz 3', grade: null},
				{name: 'Quiz 4', grade: null},
				{name: 'Quiz 5', grade: null},
				{name: 'Quiz 6', grade: null},
				{name: 'Quiz 7', grade: null},
				{name: 'Quiz 8', grade: null},
				{name: 'Quiz 9', grade: null},
				{name: 'Quiz 10', grade: null}
			]
		},
		{
			name: 'Exam 1',
			weight: 10,
			position: 300,
			dropped: null,
			grades: [
				{name: null, grade: null}
			]
		},
		{
			name: 'Exam 2',
			weight: 20,
			position: 400,
			dropped: null,
			grades: [
				{name: null, grade: null}
			]
		},
		{
			name: 'Final',
			weight: 40,
			position: 500,
			dropped: null,
			grades: [
				{name: null, grade: null}
			]
		}]
	}],
	user: {
		firstName: 'Integration',
		email: 'integration@gbdev.cf',
		created: '__created__',
		updated: '__updated__',
		lastName: null,
		settings: '{}'
	}
});

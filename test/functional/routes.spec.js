// @ts-check
const {expect} = require('chai'); // @todo: this is a global variable. Make typescript get this
const supertest = require('supertest');
const makeApp = require('../utils/app');

describe('Functional > API Routes', function () {
	let instance;

	before(async function () {
		instance = await makeApp();
	});

	it('unauthenticated', function () {
		return supertest(instance)
			.get('/api/v0/me')
			.expect(401);
	});

	describe('GET data', function () {
		it('/my/', function () {
			return supertest(instance)
				.get('/my/')
				.expect('content-type', /text\/html/)
				.expect(200)
				.expect(/<title>gradebook<\/title>/i);
		});

		it('/api/v0/me', function () {
			const trustedUser = Object.assign({}, testUtils.fixtures.trustedUser);

			delete trustedUser.id;
			delete trustedUser.gid;
			// @TODO: handle this
			delete trustedUser.updated_at;

			return supertest(instance)
				.get('/api/v0/me')
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body.theme).to.be.an('object');
					expect(body.theme.background).to.match(/generic\.jpg/);
					expect(body).to.deep.include(trustedUser);
				});
		});

		it('/api/v0/courses', function () {
			return supertest(instance)
				.get('/api/v0/courses')
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.be.an('array').with.length(5);
					body.forEach(course => {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'semester', 'name', 'cut1', 'cut2', 'cut3', 'cut4', 'cut1Name', 'cut2Name', 'cut3Name', 'cut4Name', 'credits']
						);
					});
				});
		});

		it('/api/v0/categories', function () {
			return supertest(instance)
				.get('/api/v0/categories')
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.be.an('array').with.length(16);
					body.forEach(category => {
						expect(Object.keys(category)).to.deep.equal(
							['id', 'course_id', 'name', 'weight', 'position', 'dropped']
						);
					});
				});
		});

		it('/api/v0/grades', function () {
			return supertest(instance)
				.get('/api/v0/grades')
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.be.an('array').with.length(29);
					body.forEach(course => {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'name', 'grade', 'course', 'category']
						);
					});
				});
		});

		it('/api/v0/course/{id}', function () {
			const course = Object.assign({}, testUtils.fixtures.courses[0]);
			delete course.user_id;
			course.credits = course.credit_hours;
			delete course.credit_hours;

			return supertest(instance)
				.get(`/api/v0/course/${course.id}`)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.deep.equal(course);
				});
		});

		it('/api/v0/category/{id}', function () {
			const category = Object.assign({}, testUtils.fixtures.categories[0]);

			delete category.course_id;

			return supertest(instance)
				.get(`/api/v0/category/${category.id}`)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.deep.equal(category);
				});
		});

		it('/api/v0/grade/{id}', function () {
			const grade = Object.assign({}, testUtils.fixtures.grades[0]);

			grade.course = grade.course_id;
			grade.category = grade.category_id;
			delete grade.user_id;
			delete grade.course_id;
			delete grade.category_id;

			return supertest(instance)
				.get(`/api/v0/grade/${grade.id}`)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.deep.equal(grade);
				});
		});

		it('/api/v0/core-data', function () {
			return supertest(instance)
				.get('/api/v0/core-data')
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					// @todo: mock current semester
					expect(body.categories).to.be.empty;
					expect(body.courses).to.be.an('array').with.length(5);
					for (const course of body.courses) {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'semester', 'name', 'cut1', 'cut2', 'cut3', 'cut4', 'cut1Name', 'cut2Name', 'cut3Name', 'cut4Name', 'credits']
						);
					}
				});
		});

		it('CONFLICT: /api/v0/category/{expanded:id}/expand', function () {
			const {id} = testUtils.fixtures.expandedCategory;

			return supertest(instance)
				.post(`/api/v0/category/${id}/expand`)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(412);
		});
	});

	describe('POST data', function () {
		it('/api/v0/grade/{id} where name is null', function () {
			const {id} = testUtils.fixtures.grades[0];

			return supertest(instance)
				.post(`/api/v0/grade/${id}`)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({name: null})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data.name should be string',
						context: 'Failed validating payload'
					});
				});
		});

		it('/api/v0/category/{id}/batch removing grade name', function () {
			const categoryId = testUtils.fixtures.categories[0].id;
			const gradeId = testUtils.fixtures.grades[0].id;

			return supertest(instance)
				.post(`/api/v0/category/${categoryId}/batch`)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({update: [{id: gradeId, name: null}]})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data.update[0].name should be string',
						context: 'Failed validating payload'
					});
				});
		});

		it('/api/v0/category/{id}/batch creating grade with no name', function () {
			const {id} = testUtils.fixtures.categories[0];

			return supertest(instance)
				.post(`/api/v0/category/${id}/batch`)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({create: [{name: null, grade: 92}]})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data.create[0].name should be string',
						context: 'Failed validating payload'
					});
				});
		});

		it('/api/v0/category/{id}/expand when it has no name', function () {
			const {id} = testUtils.fixtures.categoryNoName;

			return supertest(instance)
				.post(`/api/v0/category/${id}/expand`)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.expect(412)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'category name cannot be empty'
					});
				});
		});

		it('/api/v0/category/{id}/expand when it has no weight', function () {
			const {id} = testUtils.fixtures.categoryNoWeight;

			return supertest(instance)
				.post(`/api/v0/category/${id}/expand`)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.expect(412)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'category weight cannot be empty'
					});
				});
		});
	});

	describe('PUT data', function () {
		it('/api/v0/courses/import where course name is bad', function () {
			const course = testUtils.fixtures.imports[0];
			delete course.id;
			delete course.user_id;

			const category = testUtils.fixtures.categories[0];

			return supertest(instance)
				.put('/api/v0/courses/import')
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({course, categories: [category]})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data.course.name should match pattern \"^[A-Z]{3,4} \\d{3,4}$\"',
						context: 'Failed validating payload'
					});
				});
		});

		it('/api/v0/grades where name is null', function () {
			const course = testUtils.fixtures.courses[0].id;
			const category = testUtils.fixtures.categories[0].id;

			return supertest(instance)
				.put('/api/v0/grades')
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({category, course, name: null})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data.name should be string',
						context: 'Failed validating payload'
					});
				});
		});
	});
});

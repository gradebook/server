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
					expect(body).to.be.an('array').with.length(15);
					body.forEach(course => {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'semester', 'name', 'cut1', 'cut2', 'cut3', 'cut4', 'cut1Name', 'cut2Name', 'cut3Name', 'cut4Name']
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
					expect(body).to.be.an('array').with.length(42);
					body.forEach(category => {
						expect(Object.keys(category)).to.deep.equal(
							['id', 'course_id', 'name', 'weight', 'position']
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
					expect(body).to.be.an('array').with.length(81);
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
					expect(body.courses).to.be.an('array').with.length(15);
					for (const course of body.courses) {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'semester', 'name', 'cut1', 'cut2', 'cut3', 'cut4', 'cut1Name', 'cut2Name', 'cut3Name', 'cut4Name']
						);
					}
				});
		});
	});
});

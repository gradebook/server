// @ts-check
import {expect} from 'chai';
import supertest from 'supertest';
import nock from 'nock';
import {startTestServer as makeApp} from '../utils/app.js';
import * as testUtils from '../utils/index.js';
import {importJson} from '../../lib/utils/import-json.js';
import {WAITING_FOR_CLIENT_UPDATE} from '../../lib/controllers/core-data.js';

const schoolConfigurationFixture = await importJson('../fixtures/school-configuration.json', import.meta.url);

const {TEST_HOST_NAME} = testUtils.config;

describe('Functional > API Routes', function () {
	let instance;

	before(async function () {
		this.slow(2500);
		this.timeout(10_000);

		nock('http://nock.gbdev.cf')
			.get('/school-configuration.json')
			.times(0)
			.reply(200, schoolConfigurationFixture);
		instance = await makeApp();
	});

	it('unauthenticated', function () {
		return supertest(instance)
			.get('/api/v0/me')
			.set('host', TEST_HOST_NAME)
			.expect(401);
	});

	describe('GET data', function () {
		it('/my/', function () {
			return supertest(instance)
				.get('/my/')
				.set('host', TEST_HOST_NAME)
				.expect('content-type', /text\/html/)
				.expect(200)
				.expect(/<title>gradebook<\/title>/i)
				.expect(/<meta name="x-semesters" value="%7B%22primarySemester%22:%222019S%22,%22activeSemesters%22:%5B%222019S%22%5D%7D" \/>/);
		});

		it('/api/v0/me', async function () {
			const trustedUser = Object.assign({}, testUtils.fixtures.trustedUser);

			trustedUser.created = trustedUser.created_at;
			trustedUser.firstName = trustedUser.first_name;
			trustedUser.lastName = trustedUser.last_name;

			delete trustedUser.id;
			delete trustedUser.gid;
			// @TODO: handle this
			delete trustedUser.updated_at;
			delete trustedUser.created_at;
			delete trustedUser.first_name;
			delete trustedUser.last_name;

			await supertest(instance)
				.get('/api/v0/me')
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body.theme).to.not.exist;
					expect(body).to.deep.include(trustedUser);
				});
		});

		it('/api/v0/courses', function () {
			return supertest(instance)
				.get('/api/v0/courses')
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.be.an('array').with.length(5);
					for (const course of body) {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'semester', 'name', 'cutoffs', 'settings', 'credits'],
						);
					}
				});
		});

		it('/api/v0/categories', function () {
			return supertest(instance)
				.get('/api/v0/categories')
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.be.an('array').with.length(16);
					for (const category of body) {
						expect(Object.keys(category)).to.deep.equal(
							['id', 'name', 'weight', 'position', 'course', 'dropped'],
						);
					}
				});
		});

		it('/api/v0/grades', function () {
			return supertest(instance)
				.get('/api/v0/grades')
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.be.an('array').with.length(29);
					for (const course of body) {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'name', 'grade', 'course', 'category'],
						);
					}
				});
		});

		it('/api/v0/course/{id}', function () {
			const course = Object.assign({}, testUtils.fixtures.courses[0]);
			course.credits = course.credit_hours;
			delete course.user_id;
			delete course.credit_hours;

			return supertest(instance)
				.get(`/api/v0/course/${course.id}`)
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.deep.equal(course);
				});
		});

		it('/api/v0/category/{id}', function () {
			const category = Object.assign({}, testUtils.fixtures.categories[0]);

			category.dropped = null;
			category.course = category.course_id;
			delete category.course_id;
			delete category.dropped_grades;

			return supertest(instance)
				.get(`/api/v0/category/${category.id}`)
				.set('host', TEST_HOST_NAME)
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
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body).to.deep.equal(grade);
				});
		});

		it('/api/v0/core-data', function () {
			return supertest(instance)
				.get('/api/v0/core-data')
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					if (!WAITING_FOR_CLIENT_UPDATE) {
						expect(body.primarySemester).to.be.undefined;
						expect(body.activeSemesters).to.be.undefined;
					}

					expect(body.categories).to.be.an('array').with.length(13);
					expect(body.courses).to.be.an('array').with.length(5);
					for (const category of body.categories) {
						expect(Object.keys(category)).to.deep.equal(
							['id', 'name', 'weight', 'position', 'course', 'dropped', 'grades'],
						);
						expect(category.grades).to.be.an('array');
						expect(category.grades.length).to.be.at.least(1);
					}

					for (const course of body.courses) {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'semester', 'name', 'cutoffs', 'settings', 'credits'],
						);
					}
				});
		});

		it('/api/v0/core-data?includeSemesters=true', function () {
			return supertest(instance)
				.get('/api/v0/core-data?includeSemesters=true')
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					expect(body.primarySemester).to.equal('2019S');
					expect(body.activeSemesters).to.deep.equal(['2019S']);
					expect(body.categories).to.be.an('array').with.length(13);
					expect(body.courses).to.be.an('array').with.length(5);
					for (const category of body.categories) {
						expect(Object.keys(category)).to.deep.equal(
							['id', 'name', 'weight', 'position', 'course', 'dropped', 'grades'],
						);
						expect(category.grades).to.be.an('array');
						expect(category.grades.length).to.be.at.least(1);
					}

					for (const course of body.courses) {
						expect(Object.keys(course)).to.deep.equal(
							['id', 'semester', 'name', 'cutoffs', 'settings', 'credits'],
						);
					}
				});
		});

		it('/api/v0/core-data?includeSemesters=false', function () {
			return supertest(instance)
				.get('/api/v0/core-data?includeSemesters=false')
				.set('host', TEST_HOST_NAME)
				.set('cookie', testUtils.fixtures.cookies.trusted)
				.expect(200)
				.expect(({body}) => {
					if (!WAITING_FOR_CLIENT_UPDATE) {
						expect(body.primarySemester).to.be.undefined;
						expect(body.activeSemesters).to.be.undefined;
					}
				});
		});
	});

	describe('POST data', function () {
		it('/api/v0/grade/{id} where name is null', function () {
			const {id} = testUtils.fixtures.grades[0];

			return supertest(instance)
				.post(`/api/v0/grade/${id}`)
				.set('host', TEST_HOST_NAME)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({name: null})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data/name must be string',
						context: 'Failed validating payload',
					});
				});
		});

		it('/api/v0/category/{id}/batch removing grade name', function () {
			const categoryId = testUtils.fixtures.categories[0].id;
			const gradeId = testUtils.fixtures.grades[0].id;

			return supertest(instance)
				.post(`/api/v0/category/${categoryId}/batch`)
				.set('host', TEST_HOST_NAME)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({update: [{id: gradeId, name: null}]})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data/update/0/name must be string',
						context: 'Failed validating payload',
					});
				});
		});

		it('/api/v0/category/{id}/batch creating grade with no name', function () {
			const {id} = testUtils.fixtures.categories[0];

			return supertest(instance)
				.post(`/api/v0/category/${id}/batch`)
				.set('host', TEST_HOST_NAME)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({create: [{name: null, grade: 92}]})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data/create/0/name must be string',
						context: 'Failed validating payload',
					});
				});
		});
	});

	describe('PUT data', function () {
		it('/api/v0/courses where course name is bad', function () {
			const course = {
				semester: '2019S',
				name: 'Bad name course',
				cutoffs: '{"A":90,"B":80,"C":70,"D":60}',
				credits: null,
			};

			const categories = [{name: 'Single', weight: 40, position: 100, numGrades: 1, dropped: null}];

			return supertest(instance)
				.put('/api/v0/courses')
				.set('host', TEST_HOST_NAME)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({course, categories})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data/course/name must match pattern "^[A-Z]{3,4} \\d{3,4}$"',
						context: 'Failed validating payload',
					});
				});
		});

		it('/api/v0/grades where name is null', function () {
			const course = testUtils.fixtures.courses[0].id;
			const category = testUtils.fixtures.categories[0].id;

			return supertest(instance)
				.put('/api/v0/grades')
				.set('host', TEST_HOST_NAME)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.send({category, course, name: null})
				.expect(422)
				.then(request => {
					expect(request.body).to.deep.equal({
						error: 'data/name must be string',
						context: 'Failed validating payload',
					});
				});
		});
	});

	describe('DELETE data', function () {
		it('/api/v0/semester/{semester} when the semester does not exist', function () {
			return supertest(instance)
				.del('/api/v0/semester/2000F')
				.set('host', TEST_HOST_NAME)
				.set('Cookie', testUtils.fixtures.cookies.trusted)
				.expect(404);
		});
	});
});

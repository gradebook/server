const root = '../../lib/services/permissions';
const objectID = require('bson-objectid');
const settings = require('../../lib/cache/settings');

const {permissions} = require(root);
const alwaysValid = require(`${root}/../validation/is-valid`);
const createCourse = require(`${root}/create-course`);
const createCategory = require(`${root}/create-category`);
const createGrade = require(`${root}/create-grade`);
const editCourse = require(`${root}/edit-course`);
const editCategory = require(`${root}/edit-category`);
const editGrade = require(`${root}/edit-grade`);

class FakeResponse {
	constructor() {
		this.statusCalled = false;
		this.endCalled = false;
	}

	status(code) {
		this.statusCalled = true;
		this._statusCode = code;
		return this;
	}

	end() {
		this.endCalled = true;
	}
}

class ErrorWrapper extends Error {
	constructor(originalError) {
		super(`Error Wrapper: ${originalError.message}`);
		this.originalError = originalError;
	}
}

function sendFakeRequest(permissions, fnToCall) {
	const request = {permissions};
	const response = new FakeResponse();

	return new Promise((resolve, reject) => {
		return fnToCall(request, response, error => {
			if (error) {
				reject(new ErrorWrapper({error, request, response}));
			}

			resolve({request, response});
		}).then(() => {
			resolve({request, response});
		});
	});
}

const user = testUtils.fixtures.trustedUser.id;
const semester = '2019S';

describe('Unit > Permissions', function () {
	it('Valid permission map', function () {
		expect(permissions.browseCourse, 'browseCourse').to.equal(alwaysValid);
		expect(permissions.browseCategory, 'browseCategory').to.equal(alwaysValid);
		expect(permissions.browseGrade, 'browseGrade').to.equal(alwaysValid);
		expect(permissions.readCourse, 'readCourse').to.equal(editCourse);
		expect(permissions.readCategory, 'readCategory').to.equal(editCategory);
		expect(permissions.readGrade, 'readGrade').to.equal(editGrade);
		expect(permissions.createCourse, 'createCourse').to.equal(createCourse);
		expect(permissions.createCategory, 'createCategory').to.equal(createCategory);
		expect(permissions.createGrade, 'createGrade').to.equal(createGrade);
		expect(permissions.editCourse, 'editCourse').to.equal(editCourse);
		expect(permissions.editCategory, 'editCategory').to.equal(editCategory);
		expect(permissions.editGrade, 'editGrade').to.equal(editGrade);
		expect(permissions.deleteCourse, 'deleteCourse').to.equal(editCourse);
		expect(permissions.deleteCategory, 'deleteCategory').to.equal(editCategory);
		expect(permissions.deleteGrade, 'deleteGrade').to.equal(editGrade);
	});

	describe('Create Course', function () {
		it('With permission', async function () {
			const permissions = {user, semester};
			const {response} = await sendFakeRequest(permissions, createCourse);
			expect(response.statusCalled).to.be.false;
		});

		it('Semester course limit reached', async function () {
			const stub = sinon.stub(settings, 'get').returns(0);
			try {
				const permissions = {user, semester};
				const {response} = await sendFakeRequest(permissions, createCourse);
				expect(response.statusCalled).to.be.true;
				expect(response._statusCode).to.equal(403);
			} finally {
				stub.restore();
			}
		});
	});

	describe('Create Category', function () {
		const course = testUtils.fixtures.courses[0].id;

		it('With permission', async function () {
			const permissions = {user, course};
			const {response} = await sendFakeRequest(permissions, createCategory);
			expect(response.statusCalled).to.be.false;
		});

		it('Not permitted', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, course};
			const {response} = await sendFakeRequest(permissions, createCategory);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});

		it('Course has no grades', async function () {
			const permissions = {user, course: testUtils.fixtures.courseWithNoGrades.id};
			const {response} = await sendFakeRequest(permissions, createCategory);
			expect(response.statusCalled).to.be.false;
		});

		it('Category limit reached', async function () {
			const stub = sinon.stub(settings, 'get').returns(0);
			try {
				const permissions = {user, course};
				const {response} = await sendFakeRequest(permissions, createCategory);
				expect(response.statusCalled).to.be.true;
				expect(response._statusCode).to.equal(403);
			} finally {
				stub.restore();
			}
		});
	});

	describe('Create Grade', function () {
		const course = testUtils.fixtures.courses[0].id;
		const category = testUtils.fixtures.categories[0].id;

		it('With permission', async function () {
			const permissions = {user, course, category};
			const {response} = await sendFakeRequest(permissions, createGrade);
			expect(response.statusCalled).to.be.false;
		});

		it('Not permitted', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, course, category};
			const {response} = await sendFakeRequest(permissions, createGrade);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});

		it('Grade limit reached', async function () {
			const stub = sinon.stub(settings, 'get').returns(0);
			try {
				const permissions = {user, course, category};
				const {response} = await sendFakeRequest(permissions, createGrade);
				expect(response.statusCalled).to.be.true;
				expect(response._statusCode).to.equal(403);
			} finally {
				stub.reset();
			}
		});
	});

	describe('Edit Course', function () {
		const course = testUtils.fixtures.courses[0].id;

		it('Does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};
			const {response} = await sendFakeRequest(permissions, editCourse);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});

		it('With permission', async function () {
			const permissions = {user, objectId: course};
			const {response} = await sendFakeRequest(permissions, editCourse);
			expect(response.statusCalled).to.be.false;
		});

		it('Not permitted', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: course};
			const {response} = await sendFakeRequest(permissions, editCourse);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});
	});

	describe('Edit Category', function () {
		const category = testUtils.fixtures.categories[0].id;

		it('Does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};
			const {response} = await sendFakeRequest(permissions, editCategory);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});

		it('With permission', async function () {
			const permissions = {user, objectId: category};
			const {response} = await sendFakeRequest(permissions, editCategory);
			expect(response.statusCalled).to.be.false;
		});

		it('No permission', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: category};
			const {response} = await sendFakeRequest(permissions, editCategory);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});
	});

	describe('Edit Grade', function () {
		const grade = testUtils.fixtures.grades[0].id;

		it('does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};
			const {response} = await sendFakeRequest(permissions, editGrade);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});

		it('with permission', async function () {
			const permissions = {user, objectId: grade};
			const {response} = await sendFakeRequest(permissions, editGrade);
			expect(response.statusCalled).to.be.false;
		});

		it('no permission', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: grade};
			const {response} = await sendFakeRequest(permissions, editGrade);
			expect(response.statusCalled).to.be.true;
			expect(response._statusCode).to.equal(404);
		});
	});
});

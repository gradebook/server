const root = '../../lib/services/permissions';
const objectID = require('bson-objectid');
const settings = require('../../lib/services/settings');
const expectError = require('../utils/expect-error');

const {permissions} = require(root);
const alwaysValid = require(`${root}/../validation/is-valid`);
const createCourse = require(`${root}/create-course`);
const createCategory = require(`${root}/create-category`);
const createGrade = require(`${root}/create-grade`);
const editCourse = require(`${root}/edit-course`);
const editCategory = require(`${root}/edit-category`);
const editGrade = require(`${root}/edit-grade`);
const expandCategory = require(`${root}/expand-category`);
const contractCategory = require(`${root}/contract-category`);

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
		super(`Error Wrapper: ${originalError.error.message}`);
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

function assertIsNotFoundError(_error) {
	expect(_error).to.have.property('originalError');
	const {error, response} = _error.originalError;
	expect(error.statusCode).to.equal(404);
	expect(error.name).to.equal('NotFoundError');
	expect(response.statusCalled).to.be.false;
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
		expect(permissions.contractCategory, 'contractCategory').to.equal(contractCategory);
		expect(permissions.expandCategory, 'expandCategory').to.equal(expandCategory);
	});

	describe('Create Course', function () {
		it('With permission', async function () {
			const stub = sinon.stub(settings, 'get').returns(10);
			try {
				const permissions = {user, semester};
				const {response} = await sendFakeRequest(permissions, createCourse);
				expect(response.statusCalled).to.be.false;
			} finally {
				stub.restore();
			}
		});

		it('Semester course limit reached', async function () {
			const stub = sinon.stub(settings, 'get').returns(5);
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
			const stub = sinon.stub(settings, 'get').returns(10);
			try {
				const permissions = {user, course};
				const {response} = await sendFakeRequest(permissions, createCategory);
				expect(response.statusCalled).to.be.false;
			} finally {
				stub.restore();
			}
		});

		it('Not permitted', async function () {
			const stub = sinon.stub(settings, 'get').returns(10);
			try {
				const permissions = {user: testUtils.fixtures.evilUser.id, course};
				await sendFakeRequest(permissions, createCategory);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			} finally {
				stub.restore();
			}
		});

		it('Course has no grades', async function () {
			const stub = sinon.stub(settings, 'get').returns(10);
			try {
				const permissions = {user, course: testUtils.fixtures.courseWithNoGrades.id};
				const {response} = await sendFakeRequest(permissions, createCategory);
				expect(response.statusCalled).to.be.false;
			} finally {
				stub.restore();
			}
		});

		it('Category limit reached', async function () {
			const stub = sinon.stub(settings, 'get').returns(5);
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
			const stub = sinon.stub(settings, 'get').returns(10);
			try {
				const permissions = {user, course, category};
				const {response} = await sendFakeRequest(permissions, createGrade);
				expect(response.statusCalled).to.be.false;
			} finally {
				stub.restore();
			}
		});

		it('Not permitted', async function () {
			const stub = sinon.stub(settings, 'get').returns(10);
			try {
				const permissions = {user: testUtils.fixtures.evilUser.id, course, category};
				await sendFakeRequest(permissions, createGrade);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			} finally {
				stub.restore();
			}
		});

		it('Grade limit reached', async function () {
			const stub = sinon.stub(settings, 'get').returns(5);
			try {
				const permissions = {user, course, category};
				const {response} = await sendFakeRequest(permissions, createGrade);
				expect(response.statusCalled).to.be.true;
				expect(response._statusCode).to.equal(403);
			} finally {
				stub.restore();
			}
		});
	});

	describe('Edit Course', function () {
		const course = testUtils.fixtures.courses[0].id;

		it('Does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};
			try {
				await sendFakeRequest(permissions, editCourse);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});

		it('With permission', async function () {
			const permissions = {user, objectId: course};
			const {response} = await sendFakeRequest(permissions, editCourse);
			expect(response.statusCalled).to.be.false;
		});

		it('Not permitted', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: course};
			try {
				await sendFakeRequest(permissions, editCourse);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});
	});

	describe('Edit Category', function () {
		const category = testUtils.fixtures.categories[0].id;

		it('Does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};
			try {
				await sendFakeRequest(permissions, editCategory);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});

		it('With permission', async function () {
			const permissions = {user, objectId: category};
			const {response} = await sendFakeRequest(permissions, editCategory);
			expect(response.statusCalled).to.be.false;
		});

		it('No permission', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: category};
			try {
				await sendFakeRequest(permissions, editCategory);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});
	});

	describe('Edit Grade', function () {
		const grade = testUtils.fixtures.grades[0].id;

		it('Does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};
			try {
				await sendFakeRequest(permissions, editGrade);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});

		it('With permission', async function () {
			const permissions = {user, objectId: grade};
			const {response} = await sendFakeRequest(permissions, editGrade);
			expect(response.statusCalled).to.be.false;
		});

		it('No permission', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: grade};
			try {
				await sendFakeRequest(permissions, editGrade);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});
	});

	describe('Expand Category', function () {
		// Name is Test 1
		const category = testUtils.fixtures.categories[1].id;

		it('Does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};

			try {
				await sendFakeRequest(permissions, expandCategory);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});

		it('With permission', async function () {
			const permissions = {user, objectId: category};
			const {response} = await sendFakeRequest(permissions, expandCategory);
			expect(response.statusCalled).to.be.false;
		});

		it('No permission', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: category};
			try {
				await sendFakeRequest(permissions, expandCategory);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});

		it('Already expanded', async function () {
			const permissions = {user, objectId: testUtils.fixtures.expandedCategory.id};

			const {response} = await sendFakeRequest(permissions, expandCategory);

			expect(response.statusCalled).to.be.true;
			expect(response.endCalled).to.be.true;
			expect(response._statusCode).to.equal(412);
		});
	});

	describe('Contract Category', function () {
		// Name is Homework
		const category = testUtils.fixtures.expandedCategory.id;

		it('Does not exist', async function () {
			const permissions = {user, objectId: objectID.generate()};

			try {
				await sendFakeRequest(permissions, contractCategory);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});

		it('With permission', async function () {
			const permissions = {user, objectId: category};
			const {response} = await sendFakeRequest(permissions, contractCategory);
			expect(response.statusCalled).to.be.false;
		});

		it('No permission', async function () {
			const permissions = {user: testUtils.fixtures.evilUser.id, objectId: category};
			try {
				await sendFakeRequest(permissions, contractCategory);
				expectError();
			} catch (error) {
				assertIsNotFoundError(error);
			}
		});

		it('Not expanded', async function () {
			// Name is Test 1
			const permissions = {user, objectId: testUtils.fixtures.categories[1].id};

			const {response} = await sendFakeRequest(permissions, contractCategory);

			expect(response.statusCalled).to.be.true;
			expect(response.endCalled).to.be.true;
			expect(response._statusCode).to.equal(412);
		});
	});
});

const stubKnex = require('mock-knex');
const {knex} = require('../../lib/database');
const config = require('../../lib/config');
const HistoryQueue = require('../../lib/services/analytics/history-queue');

describe('Unit > HistoryQueue', function () {
	let queue;

	before(function () {
		stubKnex.mock(knex);
	});

	after(function () {
		stubKnex.unmock(knex);
	});

	beforeEach(function () {
		queue = new HistoryQueue('test.hq');
	});

	describe('Process Event', function () {
		it('normal operations', async function () {
			queue.add([1, 1, 1]);
			queue.add([2, 3, 5]);
			queue.add([1, 1, 3]);
			queue.add([5, 20, 50]);
			queue.add([3, 5, 10]);

			await queue._promise;

			expect(queue.empty).to.be.false;
			expect(queue.internalSummations).to.be.an('array').and.to.deep.equal([12, 30, 69]);
		});

		it('properly handles buffering while committing', async function () {
			// Seed the queue and wait for seed events to be processed
			queue.add([1]);
			queue.add([1]);
			queue.add([1]);
			await queue._promise;

			expect(queue.internalSummations).to.be.an('array').and.to.deep.equal([3]);

			// Add 3 elements while the queue is committing
			const promise = queue.commit();
			queue.add([2]);
			queue.add([2]);
			queue.add([2]);
			await promise;

			// Wait for the queue to empty so we can make sure no data was lost
			await queue._promise;

			await queue.process();

			expect(queue._list).to.be.empty;
			expect(queue.internalSummations).to.deep.equal([6]);

			await queue.commit();
			expect(queue.internalSummations).to.be.empty;
		});

		it('does not commit when analytics are disabled', async function () {
			let stub = sinon.stub(config, 'get').withArgs('analytics').returns('false');

			try {
				queue.pause = testUtils.expectError;

				queue.add([0]);
				await queue._promise;
				expect(queue.internalSummations).to.be.an('array').with.length(1);
				await queue.commit();
				expect(stub.calledOnce).to.be.true;
				expect(queue.internalSummations).to.be.an('array').and.is.empty;

				// @todo: stub.reset() is throwing an error for some reason
				config.get.restore();
				stub = sinon.stub(config, 'get').withArgs('analytics').returns(false);

				queue.add([0]);
				await queue._promise;
				expect(queue.internalSummations).to.be.an('array').with.length(1);
				await queue.commit();
				expect(stub.calledOnce).to.be.true;
				expect(queue.internalSummations).to.be.an('array').and.is.empty;
			} finally {
				config.get.restore();
			}
		});
	});
});

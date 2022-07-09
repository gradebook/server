// @ts-check
import sinon from 'sinon';
import {expect} from 'chai';
import * as testUtils from '../utils/index.js';
import {removeQueryTracking, enableQueryTracking} from '../utils/mocked-knex.js';
import config from '../../lib/config.js';
import HistoryQueue from '../../lib/services/analytics/history-queue.js';

describe('Unit > HistoryQueue', function () {
	let queue;

	before(enableQueryTracking);
	after(removeQueryTracking);

	beforeEach(function () {
		queue = new HistoryQueue('test.hq');
	});

	describe('Process Event', function () {
		it('normal operations', async function () {
			queue.add([null, 1, 1, 1]);
			queue.add([null, 2, 3, 5]);
			queue.add([null, 1, 1, 3]);
			queue.add([null, 5, 20, 50]);
			queue.add([null, 3, 5, 10]);

			await queue._promise;

			expect(queue.empty).to.be.false;
			expect(queue._summations.__NO_DATABASE__).to.be.an('array').and.to.deep.equal([12, 30, 69]);
		});

		it('properly handles buffering while committing', async function () {
			// Seed the queue and wait for seed events to be processed
			queue.add([null, 1]);
			queue.add([null, 1]);
			queue.add([null, 1]);
			await queue._promise;

			expect(queue._summations.__NO_DATABASE__).to.be.an('array').and.to.deep.equal([3]);

			// Add 3 elements while the queue is committing
			const promise = queue.commit();
			queue.add([null, 2]);
			queue.add([null, 2]);
			queue.add([null, 2]);
			await promise;

			// Wait for the queue to empty so we can make sure no data was lost
			await queue._promise;

			await queue.process();

			expect(queue._list).to.be.empty;
			expect(queue._summations.__NO_DATABASE__).to.deep.equal([6]);

			await queue.commit();
			expect(queue._summations.__NO_DATABASE__).to.be.empty;
		});

		it('does not commit when analytics are disabled', async function () {
			let stub = sinon.stub(config, 'get').withArgs('analytics').returns('false');

			try {
				queue.pause = testUtils.expectError;

				queue.add([null, 0]);
				await queue._promise;
				expect(queue._summations.__NO_DATABASE__).to.be.an('array').with.length(1);
				await queue.commit();
				expect(stub.calledOnce).to.be.true;
				expect(queue._summations.__NO_DATABASE__).to.be.an('array').and.is.empty;

				sinon.restore();
				stub = sinon.stub(config, 'get').withArgs('analytics').returns(false);

				queue.add([null, 0]);
				await queue._promise;
				expect(queue._summations.__NO_DATABASE__).to.be.an('array').with.length(1);
				await queue.commit();
				expect(stub.calledOnce).to.be.true;
				expect(queue._summations.__NO_DATABASE__).to.be.an('array').and.is.empty;
			} finally {
				sinon.restore();
			}
		});
	});
});

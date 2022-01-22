// @ts-check
import {ConsistencyError} from '../../errors/index.js';

// This function should NEVER be called! The response should contain no
// data, which means something went awry in the processing pipeline
export const shouldNeverBeCalled = context => {
	throw new ConsistencyError({
		err: new Error('Response body should be empty!'),
		context,
	});
};

module.exports = function sanitizeCourse(modelResponse) {
	modelResponse.credits = modelResponse.credit_hours;

	/* ============  @todo: Remove this block after cutoff migration and client transition period =========== */
	if (modelResponse.cutoffs) {
		const cutoffs = JSON.parse(modelResponse.cutoffs);

		let i = 0;
		for (const name of Object.keys(cutoffs)) {
			modelResponse[`cut${i + 1}Name`] = name;
			modelResponse[`cut${i + 1}`] = cutoffs[name];
			i++;
		}
	}
	/* ====================================================================================================== */

	delete modelResponse.user_id;
	delete modelResponse.credit_hours;

	return modelResponse;
};

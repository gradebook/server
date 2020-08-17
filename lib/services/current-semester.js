// @ts-check

const JANUARY = 1;
const MAY = 5;
const AUGUST = 8;
const DECEMBER = 12;

/**
 * @typedef {(currentMonth: number, currentDay: number, currentYear: number) => string} SemesterAllowedFunction
 */

// Spring is active from January 5 to May 25
/** @type {SemesterAllowedFunction} */
const isSpringAllowed = (currentMonth, currentDay, currentYear) => {
	const isAllowedJanuaryDay = currentMonth === JANUARY && currentDay >= 5;
	const isAllowedMayDay = currentMonth === MAY && currentDay <= 25;
	const isAllowed = isAllowedJanuaryDay || isAllowedMayDay || (currentMonth > JANUARY && currentMonth < MAY);

	return isAllowed ? `${currentYear}S` : null;
};

// Summer is active from May 10 to August 25
/** @type {SemesterAllowedFunction} */
const isSummerAllowed = (currentMonth, currentDay, currentYear) => {
	const isAllowedMayDay = currentMonth === 5 && currentDay >= 10;
	const isAllowedAugustDay = currentMonth === 8 && currentDay <= 25;
	const isAllowed = isAllowedMayDay || isAllowedAugustDay || (currentMonth > MAY && currentMonth < AUGUST);

	return isAllowed ? `${currentYear}U` : null;
};

// Fall is active from August 1 to December 28
/** @type {SemesterAllowedFunction} */
const isFallAllowed = (currentMonth, currentDay, currentYear) => {
	const isAllowedAugustDay = currentMonth === AUGUST && currentDay >= 1;
	const isAllowedDecemberDay = currentMonth === DECEMBER && currentDay <= 28;
	const isAllowed = isAllowedAugustDay || isAllowedDecemberDay || (currentMonth > AUGUST && currentMonth < DECEMBER);

	return isAllowed ? `${currentYear}F` : null;
};

// Winter is active from December 7 to January 25
/** @type {SemesterAllowedFunction} */
const isWinterAllowed = (currentMonth, currentDay, currentYear) => {
	const isAllowedDecemberDay = currentMonth === DECEMBER && currentDay >= 7;
	const isAllowedJanuaryDay = currentMonth === JANUARY && currentDay <= 25;
	const isAllowed = isAllowedDecemberDay || isAllowedJanuaryDay;
	const year = currentMonth === JANUARY ? currentYear - 1 : currentYear;

	return isAllowed ? `${year}W` : null;
};

/**
 * Compute the active semester
 *
 * Semester Timelines:
 *
 * January 15 - May 25 = Spring;
 * May 26 - August 10 = Summer;
 * August 11 - December 20 = Fall;
 * December 21 - January 14 = Winter;
 *
 * @param {number} currentMonth
 * @param {number} currentDay
 * @param {number} currentYear
 * @returns {string}
 */
function _getActiveSemester(currentMonth, currentDay, currentYear) {
	// CASE: January to May
	if (currentMonth >= JANUARY && currentMonth <= MAY) {
		// CASE: Before January 15 -> Winter of LAST year
		if (currentMonth === JANUARY && currentDay < 15) {
			return `${currentYear - 1}W`;
		}

		// CASE: After May 25 -> Summer
		if (currentMonth === MAY && currentDay > 25) {
			return `${currentYear}U`;
		}

		// CASE: Spring
		return `${currentYear}S`;
	}

	// CASE: Up to August
	if (currentMonth <= AUGUST) {
		// CASE: AFTER August 10 -> Fall
		if (currentMonth === AUGUST && currentDay > 10) {
			return `${currentYear}F`;
		}

		// CASE: BEFORE (or on) August 10 -> Summer
		return `${currentYear}U`;
	}

	// CASE: NOT December -> Fall
	if (currentMonth !== DECEMBER) {
		return `${currentYear}F`;
	}

	// CASE: After December 21 -> Winter
	if (currentDay > 21) {
		return `${currentYear}W`;
	}

	// CASE: In December but before December 21 -> Fall
	return `${currentYear}F`;
}

function computeSemesterData() {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;
	const currentDay = currentDate.getDate();

	module.exports.activeSemester = _getActiveSemester(currentMonth, currentDay, currentYear);
	module.exports.allowedSemesters = [
		isWinterAllowed(currentMonth, currentDay, currentYear),
		isSpringAllowed(currentMonth, currentDay, currentYear),
		isSummerAllowed(currentMonth, currentDay, currentYear),
		isFallAllowed(currentMonth, currentDay, currentYear)
	].filter(Boolean);
}

module.exports.computeSemesterData = computeSemesterData;

computeSemesterData();

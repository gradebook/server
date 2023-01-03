// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import {NotFoundError} from '../../errors/index.js';
import {createSettingsValidator} from './settings.js';

const VALID_COLORS = new Set([
	'#171717', // Dark Gray
	'#374151', // Cool Gray
	'#334155', // Blue Gray
	'#DC2626', // Red 1
	'#7F1D1D', // Red 2
	'#F59E0B', // Amber
	'#84CC16', // Lime
	'#10B981', // Green 1
	'#064E3B', // Green 2
	'#065F46', // Emerald
	'#0EA5E9', // Light Blue
	'#3B82F6', // Blue 1
	'#1E40AF', // Blue 2
	'#6366F1', // Indigo 1
	'#312E81', // Indigo 2
	'#6D28D9', // Purple 1
	'#4C1D95', // Purple 2
	'#DB2777', // Pink 1
	'#831843', // Pink 2
	'#E11D48', // Fuchsia
]);

const settings = {
	color: {
		isValid: color => VALID_COLORS.has(color),
	},
	alias: {
		isValid: alias => typeof alias === 'string' && alias.length >= 0 && alias.length <= 20,
	},
	grade_mode: { // eslint-disable-line camelcase
		isValid: mode => mode === 0 || mode === 1,
	},
	bonus_points: { // eslint-disable-line camelcase
		isValid: points => points === null || (typeof points === 'number' && points >= 0 && points < 10_000),
	},
};

const validateSettings = createSettingsValidator(settings, 'course');

export default function validateCourse(request) {
	if (!isObjectIDValid(request.params.id)) {
		throw new NotFoundError();
	}

	validateSettings(request, null);

	request.permissions = {
		user: request.user.id,
		objectId: request.params.id,
		forUpdate: true,
	};
}

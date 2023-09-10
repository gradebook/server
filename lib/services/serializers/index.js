// @ts-check
import {wrapSerializer as wrap} from './wrap.js';
import {serializeUser} from './user.js';
import {serializeCourse} from './course.js';
import {serializeCategory} from './category.js';
import {serializeGrade} from './grade.js';
import {serializeUserExport} from './export-data.js';
import {serializeNoop} from './pass-through.js';
import {serializeNewCourse} from './create-course.js';
import {serializeBatchResponse} from './batch-edit.js';
import {shouldNeverBeCalled} from './no-data.js';

export const user = wrap(serializeUser);
export const course = wrap(serializeCourse);
export const category = wrap(serializeCategory);
export const grade = wrap(serializeGrade);
export const exportData = wrap(serializeUserExport);
export const passThrough = wrap(serializeNoop);
export const createCourse = wrap(serializeNewCourse);
export const batchEditGrades = wrap(serializeBatchResponse);
export const noResponse = wrap(shouldNeverBeCalled);

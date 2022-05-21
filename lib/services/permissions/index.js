// @ts-check

// NOTE: you always have permission to browse your own data
export {default as browseCourse} from '../../utils/noop.js';
export {default as browseCategory} from '../../utils/noop.js';
export {default as browseGrade} from '../../utils/noop.js';
export {default as readCourse} from './edit-course.js';
export {default as readCategory} from './edit-category.js';
export {default as readGrade} from './edit-grade.js';
export {default as completeCreateCourse} from './complete-create-course.js';
export {default as createCourse} from './create-course.js';
export {default as createCategory} from './create-category.js';
export {default as createGrade} from './create-grade.js';
export {default as editCourse} from './edit-course.js';
export {default as editCategory} from './edit-category.js';
export {default as editGrade} from './edit-grade.js';
// Semesters are not unique across users so there's no real "validation" or "permissions" checks
export {default as deleteSemester} from '../../utils/noop.js';
export {default as deleteCourse} from './edit-course.js';
export {default as deleteCategory} from './edit-category.js';
export {default as deleteGrade} from './edit-grade.js';
export {default as batchEditGrades} from './batch-edit-grades.js';
// NOTE: You always have permission to view / edit your own settings
export {default as userSettings} from '../../utils/noop.js';
export {default as exportData} from '../../utils/noop.js';
export {default as reportAnIssue} from '../../utils/noop.js';

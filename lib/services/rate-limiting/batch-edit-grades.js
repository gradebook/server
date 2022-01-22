import config from '../../config.js';
import Limiter from './limiter.js';

const limiter = new Limiter(config.get('rateLimit:batchEditGrades'));

export const batchEditGrades = limiter.mw;

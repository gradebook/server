import config from '../../config.js';
import Limiter from './limiter.js';

const limiter = new Limiter(config.get('rateLimit:createCourse'));

export const createCourse = limiter.mw;

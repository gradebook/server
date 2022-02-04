// @ts-check
import config from '../../config.js';
import {RateLimiter} from './limiter.js';

export const authenticated = new RateLimiter(config.get('rateLimit:authenticated')).mw;
export const unauthenticated = new RateLimiter(config.get('rateLimit:unauthenticated')).mw;
export const batchEditGrades = new RateLimiter(config.get('rateLimit:batchEditGrades')).mw;
export const exportData = new RateLimiter(config.get('rateLimit:exportData')).mw;
export const createCourse = new RateLimiter(config.get('rateLimit:createCourse')).mw;

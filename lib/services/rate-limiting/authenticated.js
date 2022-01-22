import config from '../../config.js';
import Limiter from './limiter.js';

const limiter = new Limiter(config.get('rateLimit:authenticated'));

export const authenticated = limiter.mw;

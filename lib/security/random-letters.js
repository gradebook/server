import {randomBytes} from 'crypto';

export const randomLetters = numberBytes => randomBytes(numberBytes).toString('hex');
export default randomLetters;

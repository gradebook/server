// @ts-check
import {createHash} from 'crypto';

export const getHash = data => createHash('sha512').update(data).digest('base64');
export default getHash;

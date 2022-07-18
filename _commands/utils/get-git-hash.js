// @ts-check
import {execa} from 'execa';

export const getGitHash = (filename, workTree = '.') => execa(
	'git', ['log', '-1', '--pretty=format:% H', '--', filename], {cwd: workTree},
);

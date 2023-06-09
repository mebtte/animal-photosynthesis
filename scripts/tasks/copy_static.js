import fs from 'fs-extra';
import DIRECTORY from '../utils/directory.js';
import * as util from 'util';

const copyAsync = util.promisify(fs.cp);

export default () => {
  return copyAsync(DIRECTORY.STATIC, DIRECTORY.BUILD, {
    recursive: true,
    force: true,
  });
};

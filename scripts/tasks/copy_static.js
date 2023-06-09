import fsPromises from 'fs/promises';
import DIRECTORY from '../utils/directory.js';

export default () => {
  return fsPromises.cp(DIRECTORY.STATIC, DIRECTORY.BUILD, {
    recursive: true,
    force: true,
  });
};

import fsPromises from 'node:fs/promises';
import DIRECTORY from '../utils/directory.ts';

export default () => {
  return fsPromises.cp(DIRECTORY.STATIC, DIRECTORY.BUILD, {
    recursive: true,
    force: true,
  });
};

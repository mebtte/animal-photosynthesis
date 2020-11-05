import { promisify } from 'util';
import * as fs from 'fs';

import fsExtra from 'fs-extra';

export default {
  mkdir: fsExtra.mkdirp,
  ensureDir: fsExtra.ensureDir,
  emtpyDir: fsExtra.emptyDir,
  copy: fsExtra.copy,
  exist: fsExtra.pathExists,
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  readdir: promisify(fs.readdir),
};

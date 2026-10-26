import { promisify } from 'node:util';
import * as fs from 'node:fs';

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

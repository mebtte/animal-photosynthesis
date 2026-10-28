import directory from '../utils/directory.ts';
import fs from '../utils/fs.ts';

export default async () => {
  await fs.ensureDir(directory.BUILD);
  await fs.emtpyDir(directory.BUILD);
};

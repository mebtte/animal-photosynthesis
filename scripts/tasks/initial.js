import directory from '../utils/directory.js';
import ora from '../utils/ora.js';
import fs from '../utils/fs.js';

export default async () => {
  const spinner = ora.createSpinner('Preparing build directory...');

  await fs.ensureDir(directory.BUILD);
  await fs.emtpyDir(directory.BUILD);

  spinner.succeed('Build directory is ready');
};

import directory from '../utils/directory.js';
import fs from '../utils/fs.js';
import ora from '../utils/ora.js';

export default async () => {
  const spinner = ora.createSpinner('Copying static directory...');
  await fs.copy(directory.STATIC, directory.BUILD);
  spinner.succeed('Static directory copied');
};

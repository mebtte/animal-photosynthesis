import directory from '../utils/directory.ts';
import ora from '../utils/ora.ts';
import fs from '../utils/fs.ts';

export default async () => {
  const spinner = ora.createSpinner('正在初始化...');

  await fs.ensureDir(directory.BUILD);
  await fs.emtpyDir(directory.BUILD);

  spinner.succeed('初始化完成');
};

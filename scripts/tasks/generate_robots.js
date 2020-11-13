import fs from '../utils/fs.js';
import ora from '../utils/ora.js';
import directory from '../utils/directory.js';

const content = `User-agent: *
Disallow:
`;

export default async () => {
  const spinner = ora.createSpinner('正在生成 robots.txt ...');
  await fs.writeFile(`${directory.BUILD}/robots.txt`, content);
  spinner.succeed('robots.txt 已生成');
};

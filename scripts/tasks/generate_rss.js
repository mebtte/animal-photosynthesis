import ejs from 'ejs';

import fs from '../utils/fs.js';
import directory from '../utils/directory.js';
import config from '../config.js';
import ora from '../utils/ora.js';

export default async (articleList) => {
  const spinner = ora.createSpinner('Generating rss.xml...');
  const xml = await ejs.renderFile(`${directory.TEMPLATE}/rss.ejs`, {
    articleList,
    config,
  });
  await fs.writeFile(`${directory.BUILD}/rss.xml`, xml);
  spinner.succeed('rss.xml generated');
};

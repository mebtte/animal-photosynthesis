import ejs from 'ejs';

import fs from '../utils/fs.js';
import directory from '../utils/directory.js';
import ora from '../utils/ora.js';
import config from '../config.js';

export default async (articleList) => {
  const spinner = ora.createSpinner('正在生成 sitemap.xml ...');
  const xml = await ejs.renderFile(`${directory.TEMPLATE}/sitemap.ejs`, {
    articleList,
    config,
  });
  await fs.writeFile(`${directory.BUILD}/sitemap.xml`, xml);
  spinner.succeed('sitemap.xml 已生成');
};

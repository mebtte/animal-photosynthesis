import * as path from 'path';

import md5 from 'md5';

import ora from '../utils/ora.js';
import directory from '../utils/directory.js';
import fontmin from '../utils/fontmin.js';

export default async (articleList) => {
  const spinner = ora.createSpinner('正在生成文章所有标题字体...');
  const text = articleList.reduce((t, a) => t + a.title, '');
  const fontPath = `${directory.STATIC}/content_font.ttf`;
  const filename = await fontmin({
    fontPath,
    text,
    generateFilename: (data) => {
      const dataMd5 = md5(data);
      return `${directory.BUILD}/${dataMd5}${path.parse(fontPath).ext}`;
    },
  });
  spinner.succeed('文章所有标题字体已生成');
  return filename.replace(`${directory.BUILD}/`, '');
};

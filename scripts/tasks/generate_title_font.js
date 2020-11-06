import * as path from 'path';

import md5 from 'md5';

import fontmin from '../utils/fontmin.js';
import directory from '../utils/directory.js';
import ora from '../utils/ora.js';
import config from '../config.js';

export default async () => {
  const spinner = ora.createSpinner('Generate title font...');
  const fontPath = `${directory.STATIC}/title_font.ttf`;
  const filename = await fontmin({
    fontPath,
    text: config.title,
    generateFilename: (data) => {
      const dataMd5 = md5(data);
      return `${directory.BUILD}/${dataMd5}${path.parse(fontPath).ext}`;
    },
  });
  spinner.succeed('Title font generated');
  return filename.replace(directory.BUILD, '');
};

import * as path from 'node:path';

import md5 from 'md5';

import fontmin from '../utils/fontmin.ts';
import directory from '../utils/directory.ts';
import config from '../config.ts';

export default async () => {
  const fontPath = `${directory.ASSET}/title_font.ttf`;
  const filename = await fontmin({
    fontPath,
    text: config.title,
    generateFilename: (data) => {
      const dataMd5 = md5(data);
      return `${directory.BUILD}/${dataMd5}${
        path.parse(fontPath).ext
      }`;
    },
  });
  return filename.replace(`${directory.BUILD}/`, '');
};

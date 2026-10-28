import * as path from 'node:path';
import md5 from 'md5';
import fs from '../utils/fs.ts';
import directory from '../utils/directory.ts';
import fontmin from '../utils/fontmin.ts';
import config from '../config.ts';

const FILE_LIST = [
  `${directory.TEMPLATE}/common/footer.ejs`,
  `${directory.TEMPLATE}/article/article_action.ejs`,
];

export default async () => {
  let text =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
  for (const value of Object.values(config)) {
    text += value;
  }
  for (const file of FILE_LIST) {
    text += (await fs.readFile(file)).toString();
  }
  const fontPath = `${directory.ASSET}/common_font.ttf`;
  const filename = await fontmin({
    fontPath,
    text,
    generateFilename: (data) => {
      const dataMd5 = md5(data);
      return `${directory.BUILD}/${dataMd5}${
        path.parse(fontPath).ext
      }`;
    },
  });
  return filename.replace(`${directory.BUILD}/`, '');
};

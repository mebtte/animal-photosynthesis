import * as path from 'node:path';
import md5 from 'md5';
import directory from '../utils/directory.ts';
import fontmin from '../utils/fontmin.ts';
import type { ArticleSummary } from '../types.ts';

export default async (articleList: ArticleSummary[]) => {
  const text = articleList.reduce((t, a) => t + a.title, '');
  const fontPath = `${directory.ASSET}/content_font.ttf`;
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

import * as path from 'node:path';

import md5 from 'md5';

import fs from './fs.ts';
import directory from './directory.ts';

const map: Record<string, string> = {};

export default async (originalPath: string) => {
  let filename = map[originalPath];
  if (!filename) {
    const data = await fs.readFile(originalPath);
    const dataMd5 = md5(data);
    filename = `${dataMd5}${path.parse(originalPath).ext}`;
    await fs.writeFile(`${directory.BUILD}/${filename}`, data);
    map[originalPath] = filename;
  }
  return filename;
};

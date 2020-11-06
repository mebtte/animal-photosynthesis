import * as path from 'path';

import md5 from 'md5';

import fs from './fs.js';
import directory from './directory.js';
import event, { EventType } from './event.js';
import getResource from './get_resource.js';

export default async (originalPath) => {
  let filename = getResource(originalPath);
  if (!filename) {
    const data = await fs.readFile(originalPath);
    const dataMd5 = md5(data);
    filename = `${dataMd5}${path.parse(originalPath).ext}`;
    await fs.writeFile(`${directory.BUILD}/${filename}`, data);
    event.emit(EventType.RESOURCE_BUILT, {
      originalPath,
      newFilename: filename,
    });
  }
  return filename;
};

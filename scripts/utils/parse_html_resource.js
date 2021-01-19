import * as path from 'path';

import cheerio from 'cheerio';

import directory from './directory.js';
import fs from './fs.js';
import toBuild from './to_build.js';
import config from '../config.js';

const RESOURCE_TYPE = {
  CONTENT: 'content',
  HREF: 'href',
  SRC: 'src',
};

export default async (html) => {
  const $ = cheerio.load(html, { decodeEntities: false });
  const resourceNodeList = $(
    `${Object.values(RESOURCE_TYPE)
      .map((r) => `[${r}]`)
      .join(', ')}`,
  ).toArray();
  for (const resourceNode of resourceNodeList) {
    let type;
    let resource;
    const $resourceNode = $(resourceNode);
    if ($resourceNode.attr(RESOURCE_TYPE.CONTENT)) {
      resource = $resourceNode.attr(RESOURCE_TYPE.CONTENT);
      type = RESOURCE_TYPE.CONTENT;
    } else if ($resourceNode.attr(RESOURCE_TYPE.HREF)) {
      resource = $resourceNode.attr(RESOURCE_TYPE.HREF);
      type = RESOURCE_TYPE.HREF;
    } else {
      resource = $resourceNode.attr(RESOURCE_TYPE.SRC);
      type = RESOURCE_TYPE.SRC;
    }
    if (resource[0] !== '/' || !path.parse(resource).ext) {
      continue;
    }
    const aPath = `${directory.STATIC}${resource}`;
    const exist = await fs.exist(aPath);
    if (!exist) {
      continue;
    }
    const filename = await toBuild(aPath);
    $resourceNode.attr(type, `${config.public_path}/${filename}`);
  }
  return $.html();
};

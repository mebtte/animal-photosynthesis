import * as path from 'node:path';

import { load } from 'cheerio';

import directory from './directory.ts';
import fs from './fs.ts';
import toBuild from './to_build.ts';

const RESOURCE_TYPE = {
  CONTENT: 'content',
  HREF: 'href',
  SRC: 'src',
};

export default async (html: string) => {
  const $ = load(html);
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
    if (!resource?.startsWith('/') || !path.parse(resource).ext) {
      continue;
    }
    const aPath = `${directory.ASSET}${resource}`;
    const exist = await fs.exist(aPath);
    if (!exist) {
      continue;
    }
    const filename = await toBuild(aPath);
    $resourceNode.attr(type, `/${filename}`);
  }
  return $.html();
};

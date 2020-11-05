import * as path from 'path';

import showdown from 'showdown';
import frontMatter from 'front-matter';
import cheerio from 'cheerio';
import md5 from 'md5';

import fs from '../utils/fs.js';
import directory from '../utils/directory.js';
import getResource from '../utils/get_resource.js';
import event, { EventType } from '../utils/event.js';

export default async (id) => {
  const articleDir = `${directory.ARTICLES}/${id}`;
  const mdPath = `${articleDir}/index.md`;
  const exist = await fs.exist(mdPath);
  if (!exist) {
    return null;
  }
  const mdText = (await fs.readFile(mdPath)).toString();
  if (!mdText) {
    return null;
  }
  const { attributes, body } = frontMatter(mdText);
  const mdParser = new showdown.Converter();
  const html = mdParser.makeHtml(body);
  const $ = cheerio.load(html);
  const resourceNodeList = $('[src]').toArray();
  for (const resourceNode of resourceNodeList) {
    const node = $(resourceNode);
    const resourcePath = node.attr('src');
    if (resourcePath[0] !== '.') {
      continue;
    }
    const localPath = path.join(articleDir, resourcePath);
    let filename = getResource(localPath);
    if (!filename) {
      const data = await fs.readFile(localPath);
      const dataMd5 = md5(data);
      filename = `${dataMd5}${path.parse(localPath).ext}`;
      await fs.writeFile(`${directory.BUILD}/${filename}`, data);
      event.emit(EventType.RESOURCE_BUILT, {
        originalPath: localPath,
        newFilename: filename,
      });
    }
    $(resourceNode).attr('src', `/${filename}`);
  }
  return {
    id,
    title: attributes.title || '',
    createTime: attributes.create || '0000-00-00',
    updates: attributes.updates || [],
    hidden: attributes.hidden || false,
    content: $.html(),
  };
};

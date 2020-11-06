import * as path from 'path';

import showdown from 'showdown';
import frontMatter from 'front-matter';
import cheerio from 'cheerio';

import fs from './fs.js';
import directory from './directory.js';
import toBuild from './to_build.js';

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
    const filename = await toBuild(localPath);
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

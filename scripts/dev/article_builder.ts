import { readFile } from 'node:fs/promises';
import directory from '../utils/directory.ts';
import { invalidateResources } from '../utils/to_build.ts';
import buildArticle from '../tasks/build_article.ts';
import generateTitleFont from '../tasks/generate_title_font.ts';
import generateCommonFont from '../tasks/generate_common_font.ts';
import classifyChanges from './changes.ts';

export default function createArticleBuilder(id: string) {
  let titleFontPath: string | undefined;
  let commonFontPath: string | undefined;
  let articleContentFontPath: string | undefined;
  let updatesTemplate: string | undefined;

  return async (changes: string[]) => {
    const plan = classifyChanges(changes, id);
    if (!plan.render) return false;
    // 先标记失效, 即使本次构建失败, 下一次也不会错误地复用旧字体.
    if (plan.titleFont) titleFontPath = undefined;
    if (plan.commonFont) commonFontPath = undefined;
    if (plan.contentFont) articleContentFontPath = undefined;
    if (plan.updates) updatesTemplate = undefined;
    if (plan.invalidateAll) invalidateResources();
    else invalidateResources(changes);
    // 任一依赖失败也等待其余准备任务结束, 避免下一轮与遗留写入重叠.
    const prepared = await Promise.allSettled([
      !titleFontPath ? generateTitleFont() : titleFontPath,
      !commonFontPath ? generateCommonFont() : commonFontPath,
      updatesTemplate === undefined
        ? readFile(`${directory.TEMPLATE}/article/article_updates.ejs`, 'utf8') : updatesTemplate,
    ]);
    [titleFontPath, commonFontPath, updatesTemplate] = prepared.map((result) => {
      if (result.status === 'rejected') throw result.reason;
      return result.value;
    });
    // 正文和内容字体未变化时复用字体子集, CSS, 图片和模板保存不重复裁剪.
    const result = await buildArticle(id, {
      titleFontPath, commonFontPath, updatesTemplate, atomic: true,
      articleContentFontPath,
    });
    if (!result) throw new Error(`Article "${id}" is missing or empty.`);
    articleContentFontPath = result.articleContentFontPath;
    return true;
  };
}

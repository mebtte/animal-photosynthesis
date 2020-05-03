/* eslint-disable no-await-in-loop */
const path = require('path');
const fs = require('fs');
const util = require('util');

const mkdir = require('mkdirp');
const md5 = require('md5');

const fontmin = require('./node/utils/fontmin');
const config = require('./config');
const { INTERACTION_TEXT } = require('./src/templates/article/constants');
const transformImg = require('./node/utils/transform_img');

const readFile = util.promisify(fs.readFile);

const FONT_PATH = path.join(__dirname, './public/font');
if (!fs.existsSync(FONT_PATH)) {
  mkdir.sync(FONT_PATH);
}

exports.createPages = async ({ actions: { createPage }, graphql }) => {
  // 生成时间字体
  const timeString = '0123456789-';
  const timeStringMd5 = md5(timeString);
  const timeFontPath = `/font/${timeStringMd5}.ttf`;
  await fontmin({
    fontPath: path.join(__dirname, './node/assets/font/xin_yi_guan_hei_ti.ttf'),
    targetFilename: path.join(__dirname, 'public', timeFontPath),
    text: timeString,
  });

  // 生成title字体
  const titleMd5 = md5(config.title);
  const titleFontPath = `/font/${titleMd5}.ttf`;
  await fontmin({
    fontPath: path.join(
      __dirname,
      './node/assets/font/you_she_biao_ti_hei.ttf',
    ),
    targetFilename: path.join(__dirname, 'public', titleFontPath),
    text: config.title,
  });

  // 生成footer字体
  const footerString = (
    await readFile(path.join(__dirname, 'src/components/footer.js'))
  ).toString();
  const footerMd5 = md5(footerString);
  const footerFontPath = `/font/${footerMd5}.ttf`;
  await fontmin({
    fontPath: path.join(__dirname, './node/assets/font/xin_yi_guan_hei_ti.ttf'),
    targetFilename: path.join(__dirname, 'public', footerFontPath),
    text: footerString,
  });

  const allArticleData = await graphql(`
    {
      allMarkdownRemark(sort: { order: DESC, fields: frontmatter___create }) {
        edges {
          node {
            fileAbsolutePath
            frontmatter {
              create
              outdated
              title
              updates {
                time
                description
              }
              hidden
            }
            htmlAst
          }
        }
      }
    }
  `);

  let allArticleTitle = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const edge of allArticleData.data.allMarkdownRemark.edges) {
    const { fileAbsolutePath, frontmatter, htmlAst } = edge.node;
    const { title } = frontmatter;
    const dirs = fileAbsolutePath.split('/');
    const id = dirs[dirs.length - 2];

    const pagePath = path.join(__dirname, `./public/${id}`);
    if (!fs.existsSync(pagePath)) {
      mkdir.sync(pagePath);
    }

    /**
     * 处理文章的图片
     * 1. 同步处理产生md5
     * 2. 复制到public目录
     */
    const newHtmlAst = await transformImg({ id, ast: htmlAst });

    // 生成文章的字体
    const textData = await readFile(
      path.join(__dirname, `./articles/${id}/index.md`),
    );
    const textMd5 = md5(textData);
    const articleFontPath = `/font/${textMd5}.ttf`;
    await fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/ping_fang_chang_gui_ti.ttf',
      ),
      targetFilename: path.join(__dirname, 'public', articleFontPath),
      text: textData.toString() + Object.values(INTERACTION_TEXT).join(''),
    });

    await createPage({
      path: id,
      component: path.resolve('src/templates/article/index.js'),
      context: {
        id,
        frontmatter,
        htmlAst: newHtmlAst,
        font: {
          article: articleFontPath,
          time: timeFontPath,
          title: titleFontPath,
          footer: footerFontPath,
        },
      },
    });

    allArticleTitle += title;
  }

  // 生成所有文章标题字体
  const allArticleTitleMd5 = md5(allArticleTitle);
  const allArticleTitleFontPath = `/font/${allArticleTitleMd5}.ttf`;
  await fontmin({
    fontPath: path.join(
      __dirname,
      './node/assets/font/ping_fang_chang_gui_ti.ttf',
    ),
    targetFilename: path.join(__dirname, 'public', allArticleTitleFontPath),
    text: allArticleTitle,
  });

  await createPage({
    path: '/',
    component: path.resolve('src/templates/article_list/index.js'),
    context: {
      articleList: allArticleData.data.allMarkdownRemark.edges.map(
        ({ node }) => node,
      ),
      font: {
        time: timeFontPath,
        title: titleFontPath,
        articleTitle: allArticleTitleFontPath,
        footer: footerFontPath,
      },
    },
  });
};

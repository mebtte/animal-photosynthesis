/* eslint-disable no-await-in-loop */
const path = require('path');
const fs = require('fs');
const util = require('util');

const mkdir = require('mkdirp');

const md5 = require('./node/utils/md5');
const fontmin = require('./node/utils/fontmin');
const config = require('./config');
const { INTERACTION_TEXT } = require('./src/templates/article/constants');
const transformImg = require('./node/utils/transform_img');

const readFile = util.promisify(fs.readFile);

const FONT_PATH = path.join(__dirname, './public/font');
if (!fs.existsSync(FONT_PATH)) {
  mkdir.sync(FONT_PATH);
}

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;
  const template = path.resolve('src/templates/article/index.js');
  const result = await graphql(`
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
            }
            htmlAst
          }
        }
      }
    }
  `);

  let allArticleTitle = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const edge of result.data.allMarkdownRemark.edges) {
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
    const fontPath = `/font/${textMd5}.ttf`;
    await fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/ping_fang_chang_gui_ti.ttf',
      ),
      targetFilename: path.join(__dirname, `./public${fontPath}`),
      text: textData.toString() + Object.values(INTERACTION_TEXT).join(''),
    });

    await createPage({
      path: id,
      component: template,
      context: { id, frontmatter, htmlAst: newHtmlAst, fontPath },
    });

    allArticleTitle += title;
  }

  await Promise.all([
    /**
     * 生成所有文章标题字体
     * 用于首页文章列表
     */
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/ping_fang_chang_gui_ti.ttf',
      ),
      targetFilename: path.join(
        __dirname,
        `./public${config.all_article_title_font_path}`,
      ),
      text: allArticleTitle,
    }),

    // 生成time字体, 用于文章的日期
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/xin_yi_guan_hei_ti.ttf',
      ),
      targetFilename: path.join(__dirname, `./public${config.time_font_path}`),
      text: '0123456789-',
    }),

    // 生成title字体
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/you_she_biao_ti_hei.ttf',
      ),
      targetFilename: path.join(__dirname, `./public${config.title_font_path}`),
      text: config.title,
    }),

    // 生成footer字体
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/xin_yi_guan_hei_ti.ttf',
      ),
      targetFilename: path.join(
        __dirname,
        `./public${config.footer_font_path}`,
      ),
      text: '©0123456789MEBTTE',
    }),
  ]);
};

const path = require('path');
const fs = require('fs');
const util = require('util');

const mkdir = require('mkdirp');

const fontmin = require('./node/utils/fontmin');
const config = require('./config');
const { INTERACTION_TEXT } = require('./src/templates/article/constants');

const readFile = util.promisify(fs.readFile);
const FONT_PATH = path.join(__dirname, './public/font');

if (!fs.existsSync(FONT_PATH)) {
  mkdir.sync(FONT_PATH);
}

exports.createPages = async ({ actions, graphql, reporter }) => {
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
            html
            htmlAst
          }
        }
      }
    }
  `);
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }
  let allArticleTitle = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const edge of result.data.allMarkdownRemark.edges) {
    const { fileAbsolutePath, frontmatter, html, htmlAst } = edge.node;
    const { title } = frontmatter;
    const dirs = fileAbsolutePath.split('/');
    const id = dirs[dirs.length - 2];
    createPage({
      path: id,
      component: template,
      context: { id, frontmatter, html, htmlAst },
    });
    // 生成每篇文章的字体
    readFile(path.join(__dirname, `./articles/${id}/index.md`)).then((data) =>
      fontmin({
        fontPath: path.join(
          __dirname,
          './node/assets/font/ping_fang_chang_gui_ti.ttf',
        ),
        targetFilename: path.join(
          __dirname,
          `./public${config.article_font_path.replace('${id}', id)}`,
        ),
        text: data.toString() + Object.values(INTERACTION_TEXT).join(''),
      }),
    );

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

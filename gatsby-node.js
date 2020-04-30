const path = require('path');
const util = require('util');
const fs = require('fs');

const fontmin = require('./node/utils/fontmin');

const readFile = util.promisify(fs.readFile);
const generateFont = async ({ textFile, fontFile, filename }) => {
  const text = await readFile(textFile);
  await fontmin({
    fontPath: fontFile,
    targetFilename: filename,
    text: text.toString(),
  });
};

exports.onPreBootstrap = async () => {
  await Promise.all([
    // 生成title字体
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/you_she_biao_ti_hei.ttf',
      ),
      targetFilename: path.join(__dirname, './static/font/title_font.ttf'),
      text: '答案',
    }),

    // 生成footer字体
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/xin_yi_guan_hei_ti.ttf',
      ),
      targetFilename: path.join(__dirname, './static/font/footer_font.ttf'),
      text: '©0123456789MEBTTE',
    }),

    // 生成时间字体
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/xin_yi_guan_hei_ti.ttf',
      ),
      targetFilename: path.join(__dirname, './static/font/time_font.ttf'),
      text: '0123456789-',
    }),
  ]);
};

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
            internal {
              content
            }
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
    const {
      fileAbsolutePath,
      frontmatter,
      html,
      htmlAst,
      internal,
    } = edge.node;
    const { title } = frontmatter;
    const dirs = fileAbsolutePath.split('/');
    const id = dirs[dirs.length - 2];
    createPage({
      path: id,
      component: template,
      context: { id, frontmatter, html, htmlAst },
    });
    // 生成每篇文章的字体
    fontmin({
      fontPath: path.join(
        __dirname,
        './node/assets/font/ping_fang_chang_gui_ti.ttf',
      ),
      targetFilename: path.join(__dirname, `./static/font/articles/${id}.ttf`),
      text: internal.content,
    });

    allArticleTitle += title;
  }

  // 生成首页文章标题字体
  await fontmin({
    fontPath: path.join(
      __dirname,
      './node/assets/font/ping_fang_chang_gui_ti.ttf',
    ),
    targetFilename: path.join(
      __dirname,
      './static/font/article_title_font.ttf',
    ),
    text: allArticleTitle,
  });
};

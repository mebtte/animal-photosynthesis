/* eslint-disable no-await-in-loop */
const path = require('path');
const fs = require('fs');
const util = require('util');

const mkdir = require('mkdirp');
const md5 = require('md5');

const fontmin = require('./node/utils/fontmin');
const config = require('./config');
const transformAsset = require('./node/utils/transform_asset');

const readFileAsync = util.promisify(fs.readFile);

const FONT_DIR = path.join(__dirname, './node/font');
const FONT_OUTPUT_DIR = path.join(__dirname, './public/font');
const COMPONENT_DIR = path.join(__dirname, './src/components');
const HAS_TEXT_COMPONENTS = [
  `${COMPONENT_DIR}/edit_in_github.js`,
  `${COMPONENT_DIR}/footer.js`,
];

if (!fs.existsSync(FONT_OUTPUT_DIR)) {
  mkdir.sync(FONT_OUTPUT_DIR);
}

exports.createPages = async ({ actions: { createPage }, graphql }) => {
  // 生成组件字体
  let componentText = '0123456789-';
  for (const component of HAS_TEXT_COMPONENTS) {
    componentText += (await readFileAsync(component)).toString();
  }
  componentText = Array.from(new Set(Array.from(componentText))).join('');
  const componentTextMd5 = md5(componentText);
  const componentFontPath = `/font/${componentTextMd5}.ttf`;
  await fontmin({
    fontPath: `${FONT_DIR}/component_font.ttf`,
    targetFilename: path.join(__dirname, 'public', componentFontPath),
    text: componentText,
  });

  // 生成title字体
  const titleMd5 = md5(config.title);
  const titleFontPath = `/font/${titleMd5}.ttf`;
  await fontmin({
    fontPath: `${FONT_DIR}/title_font.ttf`,
    targetFilename: path.join(__dirname, 'public', titleFontPath),
    text: config.title,
  });

  const allArticleData = await graphql(`
    {
      allMarkdownRemark(sort: { order: DESC, fields: frontmatter___create }) {
        edges {
          node {
            fileAbsolutePath
            frontmatter {
              create
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
     * 处理文章的静态资源
     * 1. 同步处理产生md5
     * 2. 复制到public目录
     */
    const newHtmlAst = await transformAsset({ id, ast: htmlAst });

    // 生成文章的字体
    const textData = await readFileAsync(
      path.join(__dirname, `./articles/${id}/index.md`),
    );
    const textMd5 = md5(textData);
    const articleFontPath = `/font/${textMd5}.ttf`;
    await fontmin({
      fontPath: `${FONT_DIR}/content_font.ttf`,
      targetFilename: path.join(__dirname, 'public', articleFontPath),
      text: textData.toString(),
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
          title: titleFontPath,
          component: componentFontPath,
        },
      },
    });

    allArticleTitle += title;
  }

  // 生成所有文章标题字体
  const allArticleTitleMd5 = md5(allArticleTitle);
  const allArticleTitleFontPath = `/font/${allArticleTitleMd5}.ttf`;
  await fontmin({
    fontPath: `${FONT_DIR}/content_font.ttf`,
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
        title: titleFontPath,
        articleTitle: allArticleTitleFontPath,
        component: componentFontPath,
      },
    },
  });
};

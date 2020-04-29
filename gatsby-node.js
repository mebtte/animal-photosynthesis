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
    generateFont({
      textFile: path.join(__dirname, './src/components/title.js'),
      fontFile: path.join(
        __dirname,
        './node/assets/font/you_she_biao_ti_hei.ttf',
      ),
      filename: path.join(__dirname, './static/font/title_font.ttf'),
    }),

    // 生成footer字体
    generateFont({
      textFile: path.join(__dirname, './src/components/footer.js'),
      fontFile: path.join(
        __dirname,
        './node/assets/font/shi_guang_man_man_zou.ttf',
      ),
      filename: path.join(__dirname, './static/font/footer_font.ttf'),
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
              hidden
              outdated
              title
              updates {
                time
                description
              }
            }
            html
          }
        }
      }
    }
  `);
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const { fileAbsolutePath, frontmatter, html } = node;
    const dirs = fileAbsolutePath.split('/');
    const id = dirs[dirs.length - 2];
    createPage({
      path: id,
      component: template,
      context: { id, frontmatter, html },
    });
  });
};

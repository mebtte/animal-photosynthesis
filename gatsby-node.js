const path = require('path');
const util = require('util');
const fs = require('fs');

const fontmin = require('./node/utils/fontmin');

const readFile = util.promisify(fs.readFile);

exports.onPreBootstrap = async () => {
  // 生成header字体
  const text = await readFile(
    path.join(__dirname, './src/components/header.js'),
  );
  await fontmin({
    fontPath: path.join(
      __dirname,
      './node/assets/fonts/zi_ti_quan_xin_yi_guan_hei_ti.ttf',
    ),
    targetFilename: path.join(__dirname, './static/font/header_font.ttf'),
    text: text.toString(),
  });
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

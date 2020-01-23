const path = require('path');

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

const config = require('./config.json');

module.exports = {
  siteMetadata: {
    title: config.title,
    siteUrl: config.site,
    description: config.description,
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'articles',
        path: `${__dirname}/articles`,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 800,
              wrapperStyle: 'margin: 20px 0;',
            },
          },
          'gatsby-remark-responsive-iframe',
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              inlineCodeMarker: '÷',
            },
          },
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
            },
          },
          'gatsby-remark-smartypants',
          'gatsby-remark-copy-linked-files',
          'gatsby-plugin-sitemap',
          'gatsby-remark-autolink-headers', // should be listed last
        ],
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { allMarkdownRemark } }) =>
              allMarkdownRemark.edges.map(
                ({
                  node: {
                    fileAbsolutePath,
                    frontmatter: { create, title },
                  },
                }) => {
                  const dirs = fileAbsolutePath.split('/');
                  const id = dirs[dirs.length - 2];
                  return {
                    guid: id,
                    title,
                    date: create,
                    url: `${config.site}/${id}`,
                  };
                },
              ),
            query: `
              {
                allMarkdownRemark(sort: {order: DESC, fields: frontmatter___create}, filter: {frontmatter: {hidden: {eq: false}}}) {
                  edges {
                    node {
                      frontmatter {
                        create
                        title
                      }
                      fileAbsolutePath
                    }
                  }
                }
              }           
            `,
            output: '/rss.xml',
            title: `${config.title} - ${config.description}`,
          },
        ],
      },
    },
  ],
};

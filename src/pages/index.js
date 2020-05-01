import React from 'react';
import Types from 'prop-types';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import styled, { createGlobalStyle } from 'styled-components';

import config from '../../config';
import { ARTICLE_TITLE_FONT_FAMILY } from '../constants';

import Page from '../components/page';
import Header from '../components/header';
import Footer from '../components/footer';
import ArticleItem from '../components/article_item';

const ArticleList = styled.ul`
  margin: 40px 20px;
  padding: 0;
`;
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: ${ARTICLE_TITLE_FONT_FAMILY};
    src: url('${config.all_article_title_font_path}');
  }
`;

const Wrapper = ({ data }) => {
  const siteTitle = `${config.title} - ${config.description}`;
  return (
    <Page>
      <GlobalStyle />
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content="Mebtte's writting." />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={config.site} />
        <meta property="og:image" content={`${config.site}/logo.png`} />
        <link
          rel="preload"
          href={config.all_article_title_font_path}
          as="font"
          crossOrigin="anonymous"
        />
      </Helmet>
      <Header main />
      <ArticleList>
        {data.allMarkdownRemark.edges.map((edge) => {
          const { fileAbsolutePath, frontmatter } = edge.node;
          const { create, title } = frontmatter;
          const dirs = fileAbsolutePath.split('/');
          const id = dirs[dirs.length - 2];
          return (
            <ArticleItem key={id} id={id} title={title} createTime={create} />
          );
        })}
      </ArticleList>
      <Footer />
    </Page>
  );
};
Wrapper.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: Types.object.isRequired,
};

export default Wrapper;

export const query = graphql`
  {
    allMarkdownRemark(
      sort: { order: DESC, fields: frontmatter___create }
      filter: { frontmatter: { hidden: { eq: false } } }
    ) {
      edges {
        node {
          fileAbsolutePath
          frontmatter {
            create
            title
          }
        }
      }
    }
  }
`;

import React from 'react';
import Types from 'prop-types';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import styled, { createGlobalStyle } from 'styled-components';

import config from '../../config.json';

import Page from '../components/page';
import Header from '../components/header';
import Footer from '../components/footer';
import ArticleItem from '../components/article_item';

const ARTICLE_TITLE_FONT_PATH = '/font/article_title_font.ttf';

const ArticleList = styled.ul`
  margin: 40px 20px;
  padding: 0;
`;
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: article_title_font;
    src: url('${ARTICLE_TITLE_FONT_PATH}');
  }
`;

const Wrapper = ({ data }) => {
  const siteTitle = '答案 - MEBTTE写的那些东西';
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
          href={ARTICLE_TITLE_FONT_PATH}
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

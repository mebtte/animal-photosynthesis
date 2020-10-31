import React from 'react';
import Types from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

import config from '../../../config';
import { TITLE_FONT_FAMILY } from './constants';

import Page from '../../components/page';
import Header from '../../components/header';
import Footer from '../../components/footer';
import ArticleItem from './article_item';

const ArticleList = styled.ul`
  margin: 40px 20px;
  padding: 0;
`;

const Wrapper = ({ pageContext }) => {
  const { font, articleList } = pageContext;
  const siteTitle = `${config.title} - ${config.description}`;
  return (
    <Page componentFontPath={font.component}>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content="Mebtte写的那些东西" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={config.site} />
        <meta property="og:image" content={`${config.site}/logo.png`} />
        <link
          rel="preload"
          href={font.articleTitle}
          as="font"
          crossOrigin="anonymous"
        />
        <style>
          {`
            @font-face {
              font-family: ${TITLE_FONT_FAMILY};
              src: url('${font.articleTitle}');
            }
          `}
        </style>
      </Helmet>
      <Header main titleFontPath={font.title} />
      <ArticleList>
        {articleList.map(({ fileAbsolutePath, frontmatter }) => {
          const { create, title, hidden } = frontmatter;
          if (hidden) {
            return null;
          }
          const dirs = fileAbsolutePath.split('/');
          const id = dirs[dirs.length - 2];
          return (
            <ArticleItem key={id} id={id} title={title} createTime={create} />
          );
        })}
      </ArticleList>
      <Footer fontPath={font.footer} />
    </Page>
  );
};
Wrapper.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  pageContext: Types.object.isRequired,
};

export default Wrapper;

import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import 'prismjs/themes/prism-okaidia.css';

import config from '../../../config';
import { TIME_FONT_FAMILY } from '../../constants';
import astRenderer from './ast_renderer';

import Page from '../../components/page';
import Header from '../../components/header';
import Footer from '../../components/footer';
import Font from './font';
import Content from './content';
import Updates from './updates';
import Interaction from './interaction';

function findFirstImgFromAst(ast) {
  const { tagName, properties, children } = ast;
  if (tagName === 'img') {
    const { src } = properties;
    const parts = src.split('.');
    const format = parts[parts.length - 1];
    if (['jpg', 'jpeg', 'png'].includes(format)) {
      return ast;
    }
  }
  if (!children) {
    return null;
  }
  for (const astChild of children) {
    const img = findFirstImgFromAst(astChild);
    if (img) {
      return img;
    }
  }
  return null;
}

const Time = styled.time`
  font-family: ${TIME_FONT_FAMILY};
  font-size: 14px;
  color: var(--secondary-color);
`;

const Wrapper = ({ pageContext }) => {
  const { id, htmlAst, frontmatter, font } = pageContext;
  const { create, title, updates } = frontmatter;
  const img = findFirstImgFromAst(htmlAst);
  return (
    <Page timeFontPath={font.time}>
      <Helmet>
        <meta name="description" content={title} />
        <meta property="og:title" content={`${title} - ${config.title}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${config.site}/${id}`} />
        <meta
          property="og:image"
          content={
            img
              ? `${config.site}${img.properties.src}`
              : `${config.site}/logo.png`
          }
        />
        <title>
          {title} - {config.title}
        </title>
      </Helmet>
      <Font id={id} articleFontPath={font.article} />
      <Header titleFontPath={font.title} />
      <Content id={id}>
        <header>
          <h1>{title}</h1>
          <Time datetime={create}>{create}</Time>
        </header>
        {astRenderer(htmlAst)}
        {updates ? <Updates updates={updates} /> : null}
        <Interaction id={id} title={title} />
      </Content>
      <Footer fontPath={font.footer} />
    </Page>
  );
};
Wrapper.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  pageContext: Types.object.isRequired,
};

export default Wrapper;

import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import 'prismjs/themes/prism-okaidia.css';

import Page from '../../components/page';
import Header from '../../components/header';
import Footer from '../../components/footer';
import Font from './font';
import Section from './section';

const Article = styled.article`
  margin: 20px;
`;
const Title = styled.h1`
  font-family: ${({ id }) => id}_font;
  font-size: 24px;
  margin: 10px 0;
  color: var(--normal-color);
`;
const Time = styled.time`
  font-family: time_font;
  font-size: 14px;
  color: var(--secondary-color);
`;

const Wrapper = ({ pageContext }) => {
  const { id, html, frontmatter } = pageContext;
  const { create, outdated, title, updates } = frontmatter;
  return (
    <Page>
      <Helmet>
        <meta name="description" content={title} />
        <title>{title} - 答案</title>
      </Helmet>
      <Header />
      <Font id={id} />
      <Article>
        <header>
          <Title id={id}>{title}</Title>
          <Time datetime={create}>{create}</Time>
        </header>
        <Section
          id={id}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </Article>
      <Footer />
    </Page>
  );
};
Wrapper.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  pageContext: Types.object.isRequired,
};

export default Wrapper;

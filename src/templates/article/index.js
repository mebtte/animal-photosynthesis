import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import 'prismjs/themes/prism-okaidia.css';
import Page from '../../components/page';
import Footer from '../../components/footer';
import Title from './Title';
import Content from './Content';
import Edit from './Edit';

const FONT_FAMILY = 'ARTICLE_TaipeiSansTCLight';

const Container = styled.article`
  font-family: ${FONT_FAMILY};
  margin: 30px 0;
`;

const Article = ({ pageContext }) => {
  const { id, html, frontmatter } = pageContext;
  return (
    <Page>
      <Container id="article">
        <Title article={frontmatter} />
        <Content dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
      <Edit id={id} />
      <Footer />
    </Page>
  );
};
Article.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  pageContext: Types.object.isRequired,
};

export default Article;

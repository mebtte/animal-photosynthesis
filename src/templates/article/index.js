import React, { useState, useEffect } from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import loadFont from '../../utils/loadFont';
import sleep from '../../utils/sleep';

import 'prismjs/themes/prism-okaidia.css';
import Layout from '../../components/Layout';
import Footer from '../../components/Footer';
import Title from './Title';
import Content from './Content';
import Edit from './Edit';

const FONT_FAMILY = 'ARTICLE_TaipeiSansTCLight';

const Container = styled.article`
  font-family: ${FONT_FAMILY};
  margin: 30px 0;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s;
`;

const Article = ({ pageContext }) => {
  const [visible, setVisible] = useState(false);
  const { id, html, frontmatter } = pageContext;
  const { title } = frontmatter;

  useEffect(() => {
    Promise.race([
      loadFont({
        id: FONT_FAMILY,
        text: Array.from(
          new Set(document.querySelector('#article').textContent),
        )
          .sort()
          .join(''),
        font: 'TaipeiSansTCLight',
      }),
      sleep(3000),
    ])
      // eslint-disable-next-line no-console
      .catch((error) => console.error(error))
      .finally(() => setVisible(true));
  }, [pageContext]);

  return (
    <Layout title={`${title} - NotJustCode`}>
      <Container id="article" visible={visible}>
        <Title article={frontmatter} />
        <Content dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
      <Edit id={id} />
      <Footer />
    </Layout>
  );
};
Article.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  pageContext: Types.object.isRequired,
};

export default Article;

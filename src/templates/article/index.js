import React, { useEffect } from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import 'prismjs/themes/prism-okaidia.css';

import Layout from '../../components/Layout';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Title from './Title';
import Content from './Content';
import Edit from './Edit';

import download from '../../utils/download';
import { WORD } from './constants';

const fontFamily = 'ARTICLE_FONT_FAMILY';

const Container = styled.div`
  font-family: ${fontFamily};
  margin: 30px 0;
`;

const Article = ({ pageContext }) => {
  const { id, html, frontmatter } = pageContext;
  const { title, create, update } = frontmatter;

  // load font
  useEffect(() => {
    const text = Array.from(
      new Set(
        html +
          title +
          create +
          update +
          Object.keys(WORD)
            .map((key) => WORD[key])
            .join(''),
      ),
    )
      .sort()
      .join('')
      .replace(/(\s|%|")/g, '');
    download(`https://engine.mebtte.com/1/dynamic/font?font=TaipeiSansTCLight&text=${encodeURIComponent(text)}`)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const style = document.createElement('style');
        style.innerHTML = `
        @font-face{
          font-family: "${fontFamily}";
          src: url("${url}");
        }
      `;
        document.head.appendChild(style);
      })
      // eslint-disable-next-line no-console
      .catch((error) => console.error(error));
  }, [pageContext]);

  return (
    <Layout title={`${title} - NotJustCode`}>
      <Header />
      <Container>
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

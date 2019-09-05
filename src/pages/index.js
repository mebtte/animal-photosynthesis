import React, { useState, useEffect } from 'react';
import Types from 'prop-types';
import { graphql } from 'gatsby';
import styled from 'styled-components';

import Layout from '../components/Layout';
import Header from '../components/Header';
import ArticleItem from '../components/ArticleItem';
import Footer from '../components/Footer';

import download from '../utils/download';
import parseSearch from '../utils/parseSearch';
import sleep from '../utils/sleep';

const FONT_FAMILY = 'ARTICLE_LIST_ZiXinFangYunYa';

const ArticleList = styled.ul`
  font-family: ${FONT_FAMILY};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s;
`;

function loadFont() {
  // load font
  const text = Array.from(new Set(document.querySelector('#article_list').textContent))
    .sort()
    .join('');
  return Promise.race([
    download(`https://engine.mebtte.com/1/dynamic/font?font=ZiXinFangYunYa&text=${encodeURIComponent(text)}`).then(
      (font) => {
        const url = URL.createObjectURL(font);
        const style = document.createElement('style');
        style.innerHTML = `
          @font-face {
            font-family: "${FONT_FAMILY}";
            src: url(${url});
          }
        `;
        document.head.appendChild(style);
        return sleep(0);
      },
    ),
    sleep(3000),
  ]);
}

const Wrapper = ({ data }) => {
  const [withHidden, setWithHidden] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // show hidden
    const query = parseSearch(window.location.search);
    if (query.with_hidden) {
      setWithHidden(true);
    }

    setTimeout(
      () =>
        loadFont()
          // eslint-disable-next-line no-console
          .catch(console.error.bind(console))
          .finally(() => setVisible(true)),
      0,
    );
  }, [data]);

  return (
    <Layout>
      <Header />
      <ArticleList id="article_list" visible={visible}>
        {data.allMarkdownRemark.edges.map(({ node }) => {
          const {
            fileAbsolutePath,
            frontmatter: { title, create, hidden },
          } = node;
          if (hidden && !withHidden) {
            return null;
          }
          const dirs = fileAbsolutePath.split('/');
          const id = dirs[dirs.length - 2];
          return <ArticleItem key={id} article={{ id, title, create }} />;
        })}
      </ArticleList>
      <Footer />
    </Layout>
  );
};
Wrapper.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: Types.object.isRequired,
};

export default Wrapper;

export const query = graphql`
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
            update
          }
        }
      }
    }
  }
`;

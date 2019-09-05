import React, { useState, useEffect } from 'react';
import Types from 'prop-types';
import { graphql } from 'gatsby';
import styled from 'styled-components';

import Layout from '../components/Layout';
import Header from '../components/Header';
import ArticleItem from '../components/ArticleItem';
import Footer from '../components/Footer';

import loadFont from '../utils/loadFont';
import parseSearch from '../utils/parseSearch';
import sleep from '../utils/sleep';

const FONT_FAMILY = 'ARTICLE_LIST_ZiXinFangYunYa';

const ArticleList = styled.ul`
  font-family: ${FONT_FAMILY};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s;
`;

const Wrapper = ({ data }) => {
  const [withHidden, setWithHidden] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // show hidden
    const query = parseSearch(window.location.search);
    if (query.with_hidden) {
      setWithHidden(true);
    }

    sleep(0)
      .then(() =>
        Promise.race([
          loadFont({
            id: FONT_FAMILY,
            text: Array.from(new Set(document.querySelector('#article_list').textContent))
              .sort()
              .join(''),
            font: 'ZiXinFangYunYa',
          }),
          sleep(3000),
        ]),
      ) // eslint-disable-next-line no-console
      .catch(console.error.bind(console))
      .finally(() => setVisible(true));
  }, []);

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

import React, { useState, useEffect } from 'react';
import Types from 'prop-types';
import { graphql } from 'gatsby';
import styled from 'styled-components';

import Layout from '../components/Layout';
import Header from '../components/Header';
import ArticleItem from '../components/ArticleItem';
import Footer from '../components/Footer';

import parseSearch from '../utils/parseSearch';

const fontFamily = 'ZiXinFangYunYa';
const ArticleList = styled.ul`
  @font-face {
  font-family: "${fontFamily}";
  src: url(
      "https://engine.mebtte.com/1/dynamic/font?font=${fontFamily}&text=${(props) => props.text}"
    );
  }
  font-family: ${fontFamily};
`;

const Wrapper = ({ data }) => {
  const [target, setTarget] = useState('');

  const { edges } = data.allMarkdownRemark;
  const text = Array.from(
    new Set(edges.map(({ node: { frontmatter } }) => frontmatter.title + frontmatter.create).join('')),
  )
    .sort()
    .join('');

  useEffect(() => {
    const { target: t } = parseSearch(window.location.search);
    setTarget(t);
  }, []);

  return (
    <Layout>
      <Header />
      <ArticleList text={text}>
        {edges.map(({ node }) => {
          const {
            fileAbsolutePath,
            frontmatter: { title, create },
          } = node;
          const dirs = fileAbsolutePath.split('/');
          const id = dirs[dirs.length - 2];
          return <ArticleItem key={id} article={{ id, title, create }} target={target} />;
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
    allMarkdownRemark(
      sort: { order: DESC, fields: frontmatter___create }
      filter: { frontmatter: { hidden: { eq: false } } }
    ) {
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

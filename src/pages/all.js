import React, { useState, useEffect } from 'react';
import Types from 'prop-types';
import { graphql } from 'gatsby';
import styled from 'styled-components';

import Layout from '../components/Layout';
import Header from '../components/Header';
import ArticleItem from '../components/ArticleItem';
import Footer from '../components/Footer';

import parseSearch from '../utils/parseSearch';
import download from '../utils/download';

const fontFamily = 'ZiXinFangYunYa';
const ArticleList = styled.ul`
  font-family: ${fontFamily};
`;

const Wrapper = ({ data }) => {
  const [target, setTarget] = useState('');

  useEffect(() => {
    const text = Array.from(
      new Set(
        data.allMarkdownRemark.edges
          .map(({ node: { frontmatter } }) => frontmatter.title + frontmatter.create)
          .join(''),
      ),
    )
      .sort()
      .join('');
    download(`https://engine.mebtte.com/1/dynamic/font?font=${fontFamily}&text=${encodeURIComponent(text)}`)
      .then((font) => {
        const url = URL.createObjectURL(font);
        const style = document.createElement('style');
        style.innerHTML = `
        @font-face {
          font-family: "${fontFamily}";
          src: url(${url});
        }
      `;
        document.head.appendChild(style);
      })
      .catch(console.error.bind(console));
  }, [data]);

  useEffect(() => {
    const { target: t } = parseSearch(window.location.search);
    setTarget(t);
  }, []);

  return (
    <Layout>
      <Header target={target} />
      <ArticleList>
        {data.allMarkdownRemark.edges.map(({ node }) => {
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

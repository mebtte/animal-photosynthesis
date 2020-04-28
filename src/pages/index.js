import React, { useState, useEffect } from 'react';
import Types from 'prop-types';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';

import Page from '../components/page';
import Header from '../components/header';
import Footer from '../components/footer';

import parseSearch from '../utils/parse_search';

const Wrapper = ({ data }) => {
  const [withHidden, setWithHidden] = useState(false);

  useEffect(() => {
    // show hidden
    const query = parseSearch(window.location.search);
    if (query.with_hidden) {
      setWithHidden(true);
    }
  }, []);

  return (
    <Page>
      <Helmet>
        <title>答案 - MEBTTE写的那些东西</title>
        <meta name="description" content="Mebtte's writting." />
      </Helmet>
      <Header />
      <Footer />
    </Page>
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
            title
          }
        }
      }
    }
  }
`;

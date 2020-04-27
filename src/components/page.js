import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import GlobalStyle from './global_style';

const Style = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
`;

const Page = ({ children, ...props }) => (
  <Style {...props}>
    <Helmet>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="author" content="mebtte" />
      <link rel="shortcut icon" href="/logo.png" />
    </Helmet>
    <GlobalStyle />
    {children}
  </Style>
);
Page.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: Types.any,
};
Page.defaultProps = {
  children: null,
};

export default Page;

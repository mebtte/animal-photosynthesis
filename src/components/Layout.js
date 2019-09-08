import React from 'react';
import Types from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

const Style = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 30px;
`;

const Layout = ({ title, description, children }) => (
  <Style>
    <Helmet>
      <meta charSet="utf-8" />
      <meta name="author" content="mebtte" />
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
      {/* prevent google translate */}
      <meta name="google" value="notranslate" />
      <link rel="icon" href="/logo.ong" />
      <title>{title}</title>
    </Helmet>
    {children}
  </Style>
);
Layout.propTypes = {
  title: Types.string,
  description: Types.string,
  children: Types.node.isRequired,
};
Layout.defaultProps = {
  title: 'NotJustCode',
  description: "mebtte's writting.",
};

export default Layout;

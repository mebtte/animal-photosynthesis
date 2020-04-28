import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

const FONT_PATH = '/font/header_font.ttf';

const Style = styled.header`
  @font-face {
    font-family: header_font;
    src: url(${FONT_PATH});
  }
  margin: 20px;
  font-family: header_font;
`;

const Header = () => {
  return (
    <Style>
      <Helmet>
        <link
          rel="preload"
          href={FONT_PATH}
          as="font"
          crossOrigin="anonymous"
        />
      </Helmet>
      <h1>答案</h1>
    </Style>
  );
};

export default Header;

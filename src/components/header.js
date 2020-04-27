import React from 'react';
import styled from 'styled-components';

const Style = styled.header`
  @font-face {
    font-family: header_font;
    src: url('/font/header_font.ttf');
  }
  margin: 20px;
  font-family: header_font;
`;

const Header = () => {
  return (
    <Style>
      <h1>答案</h1>
    </Style>
  );
};

export default Header;

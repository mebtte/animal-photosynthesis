import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

const FONT_PATH = '/font/footer_font.ttf';

const Style = styled.footer`
@font-face {
    font-family: footer_font;
  src: url('${FONT_PATH}');
  }
  font-family: footer_font;

  margin: 50px 20px;
  font-size: 12px;
  color: var(--secondary-color);
  > a {
    color: inherit;
  }
`;

const Footer = () => (
  <Style>
    <Helmet>
      <link rel="preload" href={FONT_PATH} as="font" crossOrigin="anonymous" />
    </Helmet>
    ©&nbsp;2020&nbsp;
    <a
      href="https://mebtte.com"
      target="_blank"
      rel="noopener noreferrer"
      title="Mebtte Pan"
    >
      MEBTTE
    </a>
  </Style>
);

export default Footer;

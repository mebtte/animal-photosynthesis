import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import config from '../../config';

const Style = styled.footer`
@font-face {
    font-family: footer_font;
  src: url('${config.footer_font_path}');
  }
  font-family: footer_font;

  margin: 40px 20px;
  font-size: 12px;
  color: var(--secondary-color);
  > a {
    color: inherit;
  }
`;

const Footer = () => (
  <Style>
    <Helmet>
      <link
        rel="preload"
        href={config.footer_font_path}
        as="font"
        crossOrigin="anonymous"
      />
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

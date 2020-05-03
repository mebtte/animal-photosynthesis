import React from 'react';
import Types from 'prop-types';
import styled, { css } from 'styled-components';
import { Helmet } from 'react-helmet';

const FONT_FAMILY = 'footer_font';

const Style = styled.footer`
  ${({ fontPath }) => css`
    @font-face {
      font-family: ${FONT_FAMILY};
      src: url('${fontPath}');
    }
  `}

  font-family: ${FONT_FAMILY};
  margin: 40px 20px;
  font-size: 12px;
  color: var(--secondary-color);
  > a {
    color: inherit;
  }
`;

const Footer = ({ fontPath }) => (
  <Style fontPath={fontPath}>
    <Helmet>
      <link rel="preload" href={fontPath} as="font" crossOrigin="anonymous" />
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
Footer.propTypes = {
  fontPath: Types.string.isRequired,
};

export default Footer;

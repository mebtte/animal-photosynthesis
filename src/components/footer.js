import React from 'react';
import styled from 'styled-components';

import { COMPONENT_FONT_FAMILY } from '../constants';

const Style = styled.footer`
  font-family: ${COMPONENT_FONT_FAMILY};
  margin: 40px 20px;
  font-size: 12px;
  color: var(--secondary-color);
  > a {
    color: inherit;
  }
`;

const Footer = () => (
  <Style>
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

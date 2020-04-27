import React, { useState } from 'react';
import styled from 'styled-components';

const Style = styled.footer`
  margin: 50px 20px;
  font-size: 12px;
  color: var(--secondary-color);
  > a {
    color: inherit;
  }
`;

const Footer = () => {
  const [currentYear] = useState(new Date().getFullYear());
  return (
    <Style>
      &copy;&nbsp;
      {currentYear}
      &nbsp;
      <a
        href="https://mebtte.com"
        target="_blank"
        rel="noopener noreferrer"
        title="木公 / Mebtte Pan"
      >
        MEBTTE
      </a>
    </Style>
  );
};

export default Footer;

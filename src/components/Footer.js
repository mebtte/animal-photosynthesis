import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import download from '../utils/download';
import sleep from '../utils/sleep';

const FONT_FAMILY = 'FOOTER_ZiXinFangYunYa';

const Style = styled.footer`
  font-family: ${FONT_FAMILY};
  margin: 50px 0;
  font-size: 12px;
  color: #555;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s;
  > a {
    color: inherit;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer = () => {
  const [currentYear] = useState(new Date().getFullYear());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const text = Array.from(new Set(document.querySelector('#footer').textContent))
      .sort()
      .join('');
    Promise.race([
      download(`https://engine.mebtte.com/1/dynamic/font?font=ZiXinFangYunYa&text=${encodeURIComponent(text)}`).then(
        (font) => {
          const url = URL.createObjectURL(font);
          const style = document.createElement('style');
          style.innerHTML = `
          @font-face {
            font-family: "${FONT_FAMILY}";
            src: url(${url});
          }
        `;
          document.head.appendChild(style);
          return sleep(0);
        },
      ),
      sleep(3000),
    ])
      // eslint-disable-next-line no-console
      .catch(console.error.bind(console))
      .finally(() => setVisible(true));
  }, []);

  return (
    <Style id="footer" visible={visible}>
      &copy;&nbsp;
      {currentYear}
      &nbsp;
      <a href="https://mebtte.com">MEBTTE</a>
    </Style>
  );
};

export default Footer;

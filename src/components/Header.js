import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';

import download from '../utils/download';
import sleep from '../utils/sleep';

const TITLE_FONT_FAMILY = 'TITLE_HaiPaiQiangDiaoGunShiChaoHei';
const AUTHOR_FONT_FAMILY = 'AUTHOR_ZiXinFangYunYa';

const Style = styled.header`
  padding: 40px 0 20px 0;
  border-bottom: 1px solid #e8e8e8;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity .5s;
  > .name {
  font-family: "${TITLE_FONT_FAMILY}";
    font-size: 32px;
    display: block;
    color: black;
    > a {
      text-decoration: none;
      color: inherit;
    }
  }
  > .author {
    display: block;
    margin-top: 5px;
  font-family: "${AUTHOR_FONT_FAMILY}";
    color: rgb(237, 106, 94);
    > a {
      color: inherit;
      text-decoration: none;
    }
  }
`;

const Header = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const title = document.querySelector('#page_title').textContent;
    const author = document.querySelector('#author').textContent;
    Promise.race([
      Promise.all([
        download(
          `https://engine.mebtte.com/1/dynamic/font?font=HaiPaiQiangDiaoGunShiChaoHei&text=${encodeURIComponent(
            title,
          )}`,
        ).then((font) => {
          const url = URL.createObjectURL(font);
          const style = document.createElement('style');
          style.innerHTML = `
          @font-face {
            font-family: "${TITLE_FONT_FAMILY}";
            src: url(${url});
          }
        `;
          document.head.appendChild(style);
          return sleep(0);
        }),
        download(
          `https://engine.mebtte.com/1/dynamic/font?font=ZiXinFangYunYa&text=${encodeURIComponent(author)}`,
        ).then((font) => {
          const url = URL.createObjectURL(font);
          const style = document.createElement('style');
          style.innerHTML = `
          @font-face {
            font-family: "${AUTHOR_FONT_FAMILY}";
            src: url(${url});
          }
        `;
          document.head.appendChild(style);
          return sleep(0);
        }),
      ]),
      sleep(3000),
    ])
      // eslint-disable-next-line no-console
      .catch(console.error.bind(console))
      .finally(() => setVisible(true));
  }, []);

  return (
    <Style visible={visible}>
      <h1 id="page_title" className="name">
        <Link to="/">NotJustCode</Link>
      </h1>
      <div id="author" className="author">
        <a href="https://mebtte.com">@Mebtte Pan</a>
      </div>
    </Style>
  );
};

export default Header;

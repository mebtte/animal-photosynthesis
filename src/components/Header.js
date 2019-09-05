import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';

import loadFont from '../utils/loadFont';
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
    Promise.race([
      Promise.all([
        loadFont({
          id: TITLE_FONT_FAMILY,
          text: Array.from(new Set(document.querySelector('#page_title').textContent))
            .sort()
            .join(''),
          font: 'HaiPaiQiangDiaoGunShiChaoHei',
        }),
        loadFont({
          id: AUTHOR_FONT_FAMILY,
          text: Array.from(new Set(document.querySelector('#author').textContent))
            .sort()
            .join(''),
          font: 'ZiXinFangYunYa',
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

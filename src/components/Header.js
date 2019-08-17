import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';

const WORD = {
  TITLE: 'NotJustCode',
  AUTHOR: '@Mebtte Pan',
};
const Style = styled.header`
  @font-face {
    font-family: "title";
    src: url("https://engine.mebtte.com/1/dynamic/font?font=HaiPaiQiangDiaoGunShiChaoHei&text=${WORD.TITLE}");
  }
  @font-face {
    font-family: "author";
    src: url("https://engine.mebtte.com/1/dynamic/font?font=ZiXinFangYunYa&text=${WORD.AUTHOR}");
  }
  padding: 40px 0 20px 0;
  border-bottom: 1px solid #e8e8e8;
  > .name {
    font-family: "title";
    font-size: 32px;
    display: block;
    color: black;
    text-decoration: none;
  }
  > .author {
    display: block;
    margin-top: 5px;
    font-family: "author";
    color: rgb(237, 106, 94);
    text-decoration: none;
  }
`;

const Header = () => (
  <Style>
    <Link className="name" to="/">
      NotJustCode
    </Link>
    <a className="author" href="https://mebtte.com">
      {WORD.AUTHOR}
    </a>
  </Style>
);

export default Header;

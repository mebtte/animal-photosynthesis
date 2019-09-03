import React from 'react';
import styled from 'styled-components';

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
    > a {
      text-decoration: none;
      color: inherit;
    }
  }
  > .author {
    display: block;
    margin-top: 5px;
    font-family: "author";
    color: rgb(237, 106, 94);
    > a {
      color: inherit;
      text-decoration: none;
    }
  }
`;

const Header = () => (
  <Style>
    <h1 className="name">
      <a href="/">NotJustCode</a>
    </h1>
    <div className="author">
      <a href="https://mebtte.com">{WORD.AUTHOR}</a>
    </div>
  </Style>
);

export default Header;

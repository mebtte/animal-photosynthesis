import React from 'react';
import styled from 'styled-components';

const WORD = {
  AUTHOR: 'MEBTTE',
  CURRENT_YEAR: new Date().getFullYear(),
};

const text = Array.from(
  new Set(
    Object.keys(WORD)
      .map((key) => WORD[key])
      .join(''),
  ),
)
  .sort()
  .join('')
  .replace(/\s/g, '');
const Style = styled.footer`
  @font-face {
    font-family: "footer";
    src: url("https://engine.mebtte.com/1/dynamic/font?font=ZiXinFangYunYa&text=${text}");
  }
  font-family: "footer";
  margin: 50px 0;
  font-size: 12px;
  color: #555;
  > a {
    color: inherit;
    text-decoration: none;
    &:hover{
      text-decoration: underline;
    }
  }
`;

const Footer = () => (
  <Style>
    &copy;&nbsp;
    {WORD.CURRENT_YEAR}
    &nbsp;
    <a href="https://mebtte.com">{WORD.AUTHOR}</a>
  </Style>
);

export default Footer;

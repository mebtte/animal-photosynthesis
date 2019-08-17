import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import { WORD } from './constants';

const Style = styled.a`
  display: block;
  color: rgb(100, 55, 185);
  font-size: 14px;
  margin: 50px 0;
  text-decoration: underline;
`;

const Edit = ({ id }) => (
  <Style
    href={`https://github.com/mebtte/article/edit/master/articles/${id}/index.md`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {WORD.EDIT}
  </Style>
);
Edit.propTypes = {
  id: Types.string.isRequired,
};

export default Edit;

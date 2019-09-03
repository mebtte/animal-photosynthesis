import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import { WORD } from './constants';

const Style = styled.div`
  color: rgb(100, 55, 185);
  font-size: 14px;
  margin: 40px 0;
  > a {
    color: inherit;
  }
`;

const Edit = ({ id }) => (
  <Style>
    <a
      href={`https://github.com/mebtte/article/edit/master/articles/${id}/index.md`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {WORD.EDIT}
    </a>
  </Style>
);
Edit.propTypes = {
  id: Types.string.isRequired,
};

export default Edit;

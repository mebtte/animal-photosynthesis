import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import { TEXT } from './constants';

const Style = styled.p`
  font-size: 12px !important;
  margin: 30px 0 !important;
  > .link-wrapper {
    &:not(:last-child)::after {
      content: ' · ';
    }
  }
`;

const Interaction = ({ id }) => (
  <Style>
    <span className="link-wrapper">
      <a
        href={`https://github.com/mebtte/article/edit/master/articles/${id}/index.md`}
      >
        {TEXT.EDIT_IN_GITHUB}
      </a>
    </span>
  </Style>
);
Interaction.propTypes = {
  id: Types.string.isRequired,
};

export default Interaction;

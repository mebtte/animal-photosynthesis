import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import { COMPONENT_FONT_FAMILY } from '../constants';

const Style = styled.div`
  margin: 40px 0;
  > .link {
    font-family: ${COMPONENT_FONT_FAMILY};
    font-size: 14px;
    color: var(--normal-color);
  }
`;

const Interaction = ({ id }) => (
  <Style>
    <a
      className="link"
      href={`https://github.com/mebtte/article/edit/master/articles/${id}/index.md`}
    >
      在 Github 编辑这篇文章 →
    </a>
  </Style>
);
Interaction.propTypes = {
  id: Types.string.isRequired,
};

export default Interaction;

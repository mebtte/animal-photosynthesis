import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

const Style = styled.div`
  margin: 20px 0;
  > h1 {
    font-size: 32px;
    color: rgb(237, 106, 94);
    line-height: 1.5;
  }
  > time {
    font-size: 14px;
    color: #555;
    margin-top: 8px;
    display: block;
    letter-spacing: 1px;
  }
`;

const Title = ({ article: { title, create, update, hidden } }) => (
  <Style>
    <h1>{title}</h1>
    {hidden ? null : (
      <time>
        {create}
        创建
        {update ? `，${update}更新` : ''}
      </time>
    )}
  </Style>
);
Title.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  article: Types.object.isRequired,
};

export default Title;

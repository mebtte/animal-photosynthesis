import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

const Style = styled.li`
  list-style: none;
  margin: 20px 0;
  > .title {
    display: inline;
    margin-right: 10px;
    font-size: 18px;
    font-weight: normal;
    font-family: article_title_font;
    color: var(--primary-color);
    > a {
      text-decoration: none;
      color: inherit;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  > .time {
    font-family: time_font;
    font-size: 12px;
    color: var(--secondary-color);
    white-space: nowrap;
  }
`;

const ArticleItem = ({ id, title, createTime }) => (
  <Style>
    <h2 className="title">
      <a href={`/${id}`}>{title}</a>
    </h2>
    <span className="time">{createTime}</span>
  </Style>
);
ArticleItem.propTypes = {
  id: Types.string.isRequired,
  title: Types.string.isRequired,
  createTime: Types.string.isRequired,
};

export default ArticleItem;

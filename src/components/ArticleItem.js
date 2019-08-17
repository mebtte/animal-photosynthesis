import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';
import { Link } from 'gatsby';

const Style = styled.li`
  list-style: none;
  margin: 30px 0;
  > .title {
    font-size: 20px;
    color: rgb(237, 106, 94);
    text-decoration: none;
    line-height: 1.5;
    display: block;
    &:hover {
      text-decoration: underline;
    }
  }
  > .time {
    margin-top: 6px;
    font-size: 14px;
    color: #555;
    display: block;
    letter-spacing: 1px;
  }
`;

const ArticleItem = ({ article }) => {
  return (
    <Style>
      <Link className="title" to={`/${article.id}`}>
        {article.title}
      </Link>
      <time className="time">{article.create}</time>
    </Style>
  );
};
ArticleItem.propTypes = {
  article: Types.shape({
    id: Types.string.isRequired,
    title: Types.string.isRequired,
    create: Types.string.isRequired,
  }).isRequired,
};

export default ArticleItem;

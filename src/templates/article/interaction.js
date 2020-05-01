import React from 'react';
import Types from 'prop-types';
import styled from 'styled-components';

import config from '../../../config';
import { INTERACTION_TEXT } from './constants';

import Section from './section';

const Style = styled(Section)`
  p {
    font-size: 12px;
    > .link-wrapper {
      &:not(:last-child)::after {
        content: ' · ';
      }
    }
  }
`;

const Share = ({ id, title }) => (
  <Style>
    <p>
      <span className="link-wrapper">
        <a
          href={`https://github.com/mebtte/article/edit/master/articles/${id}/index.md`}
        >
          {INTERACTION_TEXT.EDIT_IN_GITHUB}
        </a>
      </span>
      <span className="link-wrapper">
        <a
          href={`https://twitter.com/share?text=${encodeURIComponent(
            `${title} - ${config.title}`,
          )}&url=${encodeURIComponent(`${config.site}/${id}`)}`}
        >
          {INTERACTION_TEXT.SHARE_TO_TWITTER}
        </a>
      </span>
      <span className="link-wrapper">
        <a
          href={`http://v.t.sina.com.cn/share/share.php?url=${encodeURIComponent(
            `${config.site}/${id}`,
          )}&title=${`${title} - ${config.title}`}`}
        >
          {INTERACTION_TEXT.SHARE_TO_WEIBO}
        </a>
      </span>
    </p>
  </Style>
);
Share.propTypes = {
  id: Types.string.isRequired,
  title: Types.string.isRequired,
};

export default Share;

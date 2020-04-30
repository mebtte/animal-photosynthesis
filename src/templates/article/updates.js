import React from 'react';
import Types from 'prop-types';

import Section from './section';

const Updates = ({ updates }) => (
  <Section>
    <h2>更新</h2>
    <table>
      <tbody>
        {updates.map(({ description, time }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={index}>
            <td>{time}</td>
            <td>{description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Section>
);
Updates.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  updates: Types.object.isRequired,
};

export default Updates;

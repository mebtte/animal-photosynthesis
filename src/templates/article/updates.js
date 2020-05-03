import React from 'react';
import Types from 'prop-types';

const Updates = ({ updates }) => (
  <>
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
  </>
);
Updates.propTypes = {
  updates: Types.arrayOf(Types.object).isRequired,
};

export default Updates;

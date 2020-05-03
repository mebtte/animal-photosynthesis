const crypto = require('crypto');

function md5(data) {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
}

module.exports = md5;

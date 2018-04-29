var jwt = require('jsonwebtoken');
const secret = 'someSecret123';

module.exports = function(token) {
  return new Promise( (resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);

      resolve(decoded);
    });
  });
}
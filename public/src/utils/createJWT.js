var jwt = require('jsonwebtoken');
var jwtConfig = require('../../config/jwt');

module.exports = function(payload) {
  return jwt.sign(payload, jwtConfig.jwtSecret);
}
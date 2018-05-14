var verifyJWT = require('../utils/verifyJWT');

module.exports = function(request, response, next) {
  var tokenFromHeader = request.get('token');

  verifyJWT(tokenFromHeader).
    then( decoded => {
      request.user = decoded;
      next();
    })
    .catch(err => {
      next();
    });
}

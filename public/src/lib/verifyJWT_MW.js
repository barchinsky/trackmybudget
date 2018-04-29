var verifyJWT = require('../utils/verifyJWT');

module.exports = function(request, response, next) {
  var token = request.body.token;

  verifyJWT(token).
    then( decoded => {
      request.user = decoded;
      next();
    })
    .catch(err => {
      next();
    });
}
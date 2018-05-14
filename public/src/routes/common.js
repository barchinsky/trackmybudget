var verifyJWT_MW = require('../lib/verifyJWT_MW');
var { sendResponse, isLogedIn, buildFailedResponse, buildSuccessResponse } = require('../utils/responseUtils');

module.exports = function(app, passport, logger, jwt) {
  app.get("/", function(request, response){
      logger.info("/");
      sendResponse(response, {status:'/status - status of server'});
  });

  app.get("/status", verifyJWT_MW, isLogedIn, function(request, response){
      sendResponse(response, {status:'alive'});
  });

  app.get("/isauth", verifyJWT_MW, function(request, response){
    logger.info("isauth()", request.user, '|');
    sendResponse(response, {isAuthenticated: !!request.user});
  });


  app.post("/login", function(request, response, next) {
    logger.info('login requested');
    passport.authenticate('local-login', function(err, userData, info) {
      if (err) {
        sendResponse(response, {error: err});
        return;
      }

      if (!userData) {
        sendResponse(response, {data:request.flash('login')});
        return;
      }

      sendResponse(response, buildSuccessResponse(userData));
    })(request, response, next);
  });

  // app.get("/logout", function(request, response) {
  //   logger.info("/logout");
  //   delete request.session.authorized;
  //   sendResponse(response, SUCCESS);
  // });

  // process the signup form
  app.post('/signup', function(request, response, next) {
    logger.info('signup');
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) {
        logger.error('Error received:', err);
        return next(err);
        }

      if (!user) {
        var msg = request.flash('signupMessage');
        logger.info(msg);
        sendResponse(response, buildFailedResponse({message: msg}));
        return;

       }

      logger.info('user registered:', user.username);
      sendResponse(response, buildSuccessResponse([]));

    })(request, response, next);
  });
}

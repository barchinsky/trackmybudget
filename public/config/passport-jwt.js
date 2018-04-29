var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// load up the user model
var User = require('../app/models/user');


module.exports = function(passport, logger) {
  var jwtOptions = {}
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  jwtOptions.secretOrKey = 'tasmanianDevil';

  passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {
      console.log('payload received', jwt_payload);
      // usually this would be a database call:
      
       User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                logger.info(err);
                return next(err);
            }

            // check to see if theres already a user with that email
            if (user) {
                logger.info('user already taken');
                return next(null, false);
            } else {

                // if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    logger.info('newUser',newUser);
                    return next(null, newUser);
                });
            }

        });    
  );
}
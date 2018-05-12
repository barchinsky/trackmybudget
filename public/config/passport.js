// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../src/models/user');

var jwt = require('jsonwebtoken');
var createJWT = require('../src/utils/createJWT');

// expose this function to our app using module.exports
module.exports = function(passport, logger) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        logger.info(email, password);
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err) {
                logger.info(err);
                return done(err);
            }

            // check to see if theres already a user with that email
            if (user) {
                logger.info('user already taken');
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
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
                    var token = createJWT({userId:newUser.id});
                    logger.info('newUser', newUser);
                    return done(null, {userId:newUser.id, token:token});
                });
            }

        });    

        });

    }));

    // local login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },
    function(req, email, password, done) {
        process.nextTick(function() {
            logger.info('local-login', email, password);
            User.findOne({'local.email': email}, function(err, user) {
                if (err) {
                    logger.info(err);
                    return done(err);
                }

                if (!user) {
                    logger.info('user not foundd:', email);
                    return done(null, false, req.flash('login', 'No user found:'+email));
                }

                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('login', 'Password is invalid'));
                }

                var token = createJWT({userId: user.id});
                return done(null, {userId:user.id, token:token});
            });
        });
    }));

};

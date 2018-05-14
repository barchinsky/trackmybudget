var verifyJWT_MW = require('./src/lib/verifyJWT_MW');
var db = require('./src/utils/db');

var Budget = require('./src/models/budget');
var Category = require('./src/models/category');
var Transaction = require('./src/models/transaction');

var { isLogedIn, buildFailedResponse, buildSuccessResponse, sendResponse } = require('./src/utils/responseUtils');

module.exports = function(app, passport, logger, jwt) {
  require('./src/routes/budget.js')(app, passport, logger, jwt);

  app.get("/", function(request, response){
      logger.info("/");
      sendResponse(response, {status:'/status - status of server'});
  });

  app.get("/status", [verifyJWT_MW, isLogedIn], function(request, response){
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



  app.post('/add/category', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    var {name, color} = request.body;
    logger.info(`category name:${name} color:${color} userId:${user.userId}`);

    var newCat = new Category();
    newCat.userId = user.userId;
    newCat.name = name;
    newCat.color = color;

    newCat.save( (err, category) => {
      if (err) {
        sendResponse(response, buildFailedResponse(err));
        return;
      } else {
        sendResponse(response, buildSuccessResponse(category));
      }
    });

  });

  app.get('/categories', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    Category.find({userId: user.userId}, (err, result) => {
      if(err) {
        sendResponse(response, buildFailedResponse(err));
        return;
      }
      console.log(result);
      sendResponse(response, buildSuccessResponse(result));
    });

  });

  app.post('/update/category', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;
    const {category, name, color} = request.body;

    if (!category) {
      sendResponse(response, buildFailedResponse({message: 'No category field specified.'}));
      return;
    }

    if (!name || !color) {
      sendResponse(response, buildFailedResponse({message: 'No value to modify specified. {name} and {color} has to be set.'}));
      return;
    }

    Category.findOneAndUpdate(
      {userId: user.userId, _id: category},
      {$set: {name: name, color: color} },
      {returnNewDocument: true},
      (err, result) => {
        if (err) {
          sendResponse(response, buildFailedResponse(err));
          return;
        }

        sendResponse(response, buildSuccessResponse(result));

    });
  });

  app.get('/transactions', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    Transaction.find({userId: user.userId}, (err, result) => {
      if(err) {
        sendResponse(response, buildFailedResponse(err));
        return;
      }
      sendResponse(response, buildSuccessResponse(result));
    });

  });

  app.post('/add/transaction', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    const { date, amount, category, comment } = request.body;

    if( !date || !amount || !category || !comment ) {
      sendResponse(response, {status: 'failed', error:'{date}, {amount}, {category}, {comment} are mandatory!'});
      return;
    }

    const transactionDate = new Date(date);

    var t = new Transaction();
    t.userId = user.userId;
    t.amount = amount;
    t.date = date;
    t.category = category;
    t.comment = comment;

    t.save( (err, res) => {
      if (err) {
        sendResponse(response, buildFailedResponse(err));
        return;
      } else {
        sendResponse(response, buildSuccessResponse(res));
      }
    });

  });

  app.post('/update/transaction', verifyJWT_MW, isLogedIn, function(request, response, next) {
    const user = request.user;

    const { transaction, date, amount, category, comment } = request.body;

    if (!transaction) {
      sendResponse(response, buildFailedResponse({message:'No transaction id specified!'}));
      return;
    }

    if (!date || !amount || !category) {
      sendResponse(response, buildFailedResponse({message:'{date}, {amount}, {comment} and {category} are mandatory!'}));
      return;
    }

    Transaction.findOneAndUpdate(
      {userId: user.userId, _id: transaction},
      {$set: {amount: amount, date: date, category: category, comment: comment}},
      {returnNewDocument: true},
      (err, res) => {
        if (err) {
          sendResponse(response, buildFailedResponse(err));
          return;
        }

        sendResponse(response, buildSuccessResponse(res));
      }
    )
  });

  app.post('/remove/transaction', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;
    const { transaction } = request.body;

    if (!transaction) {
      sendResponse(response, buildFailedResponse({message: 'No transaction id specified!'}));
      return;
    }

    Transaction.deleteOne({_id:transaction}, (err, res) => {
      if (err) {
        sendResponse(response, buildFailedResponse(err));
        return;
      }

      sendResponse(response, buildSuccessResponse([]));
    })
  });

}

var verifyJWT_MW = require('./src/lib/verifyJWT_MW');
var Budget = require('./src/models/budget');
var Category = require('./src/models/category');
var Transaction = require('./src/models/transaction');

module.exports = function(app, passport, logger, jwt) {
  app.get("/", function(request, response){
      logger.info("/");
      sendResponse(response, {status:'/status - status of server'});
  });

  app.post("/status", [verifyJWT_MW, isLogedIn], function(request, response){
      sendResponse(response, {status:'alive'});
  });

  app.post("/isauth", verifyJWT_MW, function(request, response){
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

      sendResponse(response, userData);
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
        sendResponse(response, {data: [], msg:msg, err:null});
        return;

       }

      logger.info('user registered:', user.username);
      sendResponse(response, {data:user});

    })(request, response, next);
  });

  app.post('/add/budget', verifyJWT_MW, isLogedIn, function(request, response, next){
    var userId = request.user.userId;
    // var budgetName = request.body.name;
    // var startDate = request.body.startDate;
    // var endDate = request.body.endDate;
    // var estimate = request.body.estimate;
    logger.info('add.budget');
    const {name, startDate, endDate, estimate} = request.body;
    logger.info(userId, name, startDate, endDate, estimate);
    // sendResponse(response, {status: 'success'});
    // return;

    var newBudget = Budget();
    newBudget.userId = userId;
    newBudget.name = name;
    newBudget.startDate = startDate;
    newBudget.endDate = endDate;
    newBudget.estimate = estimate || 0;

    newBudget.save(err => {
      if (err) {
        sendResponse(response, {status: 'failed', error: err});
        return;
      } else {
        sendResponse(response, {status: 'success'});
      }

    });

    //db.createBudget(userId, request.body)
  });

  app.post('/update/budget', verifyJWT_MW, isLogedIn, function(request, response, next){
    var userId = request.user.userId;
    logger.info('update.budget');
    const {budget, name, startDate, endDate, estimate} = request.body;
    logger.info(userId, name, startDate, endDate, estimate);
    // sendResponse(response, {status: 'success'});
    // return;

    if (!budget || !name || !startDate || !endDate || !estimate) {
      sendResponse(response, {status:'failed', error: '{budget}, {name}, {startDate}, {endDate}, {estimate} are mandatory!', data:[]});
      return;
    }

    Budget.findOneAndUpdate(
      {
        userId: userId,
        _id: budget

      },
      { $set:{
          name: name,
          startDate: startDate,
          endDate: endDate,
          estimate: estimate,
        }
      },
      (err, result) => {
      if (err) {
        sendResponse(response, {status: 'failed', error: err, data: []});
        return;
      } else {
        sendResponse(response, {status: 'success', data: result, error: null});
      }
    });

    //db.createBudget(userId, request.body)
  });

  app.post('/budgets', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    Budget.find({userId: user.userId}, (err, result) => {
      if(err) {
        sendResponse(response, {status: 'failed', error: err});
        return;
      }
      console.log(result);
      sendResponse(response, {status:'success', data: result});
    });
  });

  app.get('/remove/budget', verifyJWT_MW, isLogedIn, function(request, response, next) {
    logger.info('remove.budget');
    sendResponse(response, {status: 'not implemented!'});

  });

  // find transactions by budget id
  app.post('/budget/transactions', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;
    var { budget } = request.body;

    if (!budget) {
      sendResponse(response, buildFailedResponse({message:'No budget specified!'}));
      return;
    }

    Budget.findOne({
      userId:user.userId,
      _id:budget
    }, (err, budget) => {
      if (err) {
        sendResponse(response, buildFailedResponse(err));
        return;
      }
      const {startDate, endDate} = budget;
      console.log('Looking for transactions between:',startDate, endDate);

      // find transactions made between budget start and end dates
      Transaction.find({
        date : { $gte: startDate, $lt: endDate}
      }, (err, transactions) => {
        if (err) {
          sendResponse(response, buildFailedResponse(err));
          return;
        }

        // find sum of all transactionSchema
        let amountSpent = transactions.reduce((acc, transaction) => {
          return acc.amount + transaction.amount;
        });

        console.log("Spent for current budget:", amountSpent);
        const respData = {transactions:transactions, spent: amountSpent}

        sendResponse(response, buildSuccessResponse(respData));
      })

    });
  });

  app.post('/add/category', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    var {name, color} = request.body;
    logger.info(`category name:${name} color:${color} userId:${user.userId}`);

    var newCat = new Category();
    newCat.userId = user.userId;
    newCat.name = name;
    newCat.color = color;

    newCat.save( err => {
      if (err) {
        sendResponse(response, {status: 'failed', error: err});
        return;
      } else {
        sendResponse(response, {status: 'success', error: null, data:[]});
      }
    });

  });

  app.post('/categories', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    Category.find({userId: user.userId}, (err, result) => {
      if(err) {
        sendResponse(response, {status: 'failed', error: err});
        return;
      }
      console.log(result);
      sendResponse(response, {status:'success', data: result});
    });

  });

  app.post('/update/category', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;
    const {category, name, color} = request.body;

    if (!category) {
      sendResponse(response, {status: 'failed', err: 'No category field specified.'});
      return;
    }

    if (!name || !color) {
      sendResponse(response, {status: 'failed', err: 'No value to modify specified. {name} and {color} has to be set.', data:[]});
      return;
    }

    Category.findOneAndUpdate(
      {userId: user.userId, _id: category},
      {$set: {name: name, color: color} },
      {returnNewDocument: true},
      (err, result) => {
        if (err) {
          sendResponse(response, {status: 'failed', data: [], error: err});
          return;
        }

        sendResponse(response, {status: 'success', data:result, error: null});

    });
  });

  app.post('/transactions', verifyJWT_MW, isLogedIn, function(request, response, next) {
    var user = request.user;

    Transaction.find({userId: user.userId}, (err, result) => {
      if(err) {
        sendResponse(response, buildFailedResponse(err));
        return;
      }
      console.log(result);
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
        sendResponse(response, {status: 'failed', error: err, data:[]});
        return;
      } else {
        sendResponse(response, {status: 'success', error: null, data:[res]});
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
        sendResponse(response, {status:'failed', error: err, data:[]});
        return;
      }

      sendResponse(response, {status:'success', data:res, error:null});
    })
  });

 function isLogedIn(request, response, next) {
    logger.info("isLogedIn", !!request.user);
    if (!!request.user) {
      next();
      return;
    }

    response.status(400)
        .json({message: "Invalid token."});
  }

  function sendResponse(response, data){
    //logger.info("sendResponse()");
    // Convert data to Json-friendly object
    // Send results back to the client
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.send(data);
    response.end();

    //logger.info("~sendResponse()");
  }

  function buildFailedResponse(err) {
    return {
      status: 'failed',
      error: err,
      data: []
    }
  }

  function buildSuccessResponse(data) {
    return {
      status: 'success',
      data: data,
      erorr: null,
    }
  }
}

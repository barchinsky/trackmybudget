var verifyJWT_MW = require('./src/lib/verifyJWT_MW');
var Budget = require('./src/models/budget');
var Category = require('./src/models/category');

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
        sendResponse(response, {status: 'success'});
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
}
var verifyJWT_MW = require('../lib/verifyJWT_MW');
var db = require('../utils/db');

var Budget = require('../models/budget');
var Transaction = require('../models/transaction');
var { isLogedIn, buildFailedResponse, buildSuccessResponse, sendResponse } = require('../utils/responseUtils');

module.exports = function(app, passport, logger, jwt) {
  app.post('/budgets', verifyJWT_MW, isLogedIn, async (request, response, next) => {
    var user = request.user;
      try {
        const budgets = await db.getBudgetsWithAmount(user.userId);
        sendResponse(response, buildSuccessResponse(budgets));
      } catch (e) {
        sendResponse(response, buildFailedResponse(err));
      }
  });

  app.post('/add/budget', verifyJWT_MW, isLogedIn, function(request, response, next){
    var userId = request.user.userId;
    logger.info('add.budget');
    const {name, startDate, endDate, estimate} = request.body;
    logger.info(userId, name, startDate, endDate, estimate);

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
        sendResponse(response, buildFailedResponse(err));
        return;
      } else {
        sendResponse(response, buildSuccessResponse(result));
      }
    });

    //db.createBudget(userId, request.body)
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

        sendResponse(response, buildSuccessResponse(transactions));
      })

    });
  });
}

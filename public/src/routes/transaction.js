var verifyJWT_MW = require('../lib/verifyJWT_MW');
var { sendResponse, isLogedIn, buildFailedResponse, buildSuccessResponse } = require('../utils/responseUtils');

var Transaction = require('../models/transaction');

module.exports = function(app, passport, logger, jwt) {
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

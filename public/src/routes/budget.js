var verifyJWT_MW = require('../lib/verifyJWT_MW');
var db = require('../utils/db');

var Budget = require('../models/budget');
var Transaction = require('../models/transaction');

module.exports = function(app, passport, logger, jwt, isLogedIn, sendResponse, buildFailedResponse, buildSuccessResponse) {
  app.post('/budgets', verifyJWT_MW, isLogedIn, async (request, response, next) => {
    var user = request.user;
      try {
        const budgets = await db.getBudgetsWithAmount(user.userId);
        sendResponse(response, buildSuccessResponse(budgets));
      } catch (e) {
        sendResponse(response, buildFailedResponse(err));
      }
  });
}

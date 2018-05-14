var verifyJWT_MW = require('../lib/verifyJWT_MW');
var { sendResponse, isLogedIn, buildFailedResponse, buildSuccessResponse } = require('../utils/responseUtils');

var Category = require('../models/category');

module.exports = function(app, passport, logger, jwt) {
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
  })
}

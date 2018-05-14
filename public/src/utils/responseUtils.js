 function isLogedIn(request, response, next) {
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

  module.exports = {
    isLogedIn: isLogedIn,
    sendResponse: sendResponse,
    buildFailedResponse,
    buildSuccessResponse
  }

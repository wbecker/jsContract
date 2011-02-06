var assertThrowsException = function () {
  JsUnit._validateArguments(1, arguments);
  try {
    JsUnit._nonCommentArg(1, 1, arguments)();
  }
  catch (e) {
    JsUnit._assert(JsUnit._commentArg(1, arguments), true);
    return;
  }
  assert(JsUnit._commentArg(1, arguments), false, "Exception not thrown");
}

var assertThrowsExceptionOfType = function () {
  JsUnit._validateArguments(2, arguments);
  try {
    JsUnit._nonCommentArg(1, 2, arguments)();
  }
  catch (e) {
    var exceptionType = JsUnit._nonCommentArg(2, 2, arguments);
    if (exceptionType && !(e instanceof exceptionType)) {
      JsUnit._assert(JsUnit._commentArg(1, arguments), false, "Exception thrown of incorrect type");
    }
    assert(JsUnit._commentArg(1, arguments), true);
    return;
  }
  JsUnit._assert(JsUnit._commentArg(1, arguments), false, "Exception not thrown");
}

var assertDoesntThrowException = function () {
  JsUnit._validateArguments(1, arguments);
  try {
    JsUnit._nonCommentArg(1, 1, arguments)();
  }
  catch (e) {
    JsUnit._assert(JsUnit._commentArg(1, arguments), false, "Exception thrown");
  }
  assert(JsUnit._commentArg(1, arguments), true);
}


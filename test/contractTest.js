/*jslint white: false, onevar: true, undef: true, 
         newcap: true, nomen: false, regexp: true, plusplus: true, 
         bitwise: true, evil: true, maxerr: 5, maxlen: 80 */
/*global JsContract: false, _: false, Person: true, console, 
  assertThrowsException, assertDoesntThrowException, 
  assertThrowsExceptionOfType */

assertThrowsException(
  "rules must not be something other than an object",
  function () {
    var x = new JsContract("", function () {});
  }
);

assertThrowsException(
  "rules must contain some rule",
  function () {
    var x = new JsContract({}, function () {});
  }
);
var testRules = function (ruleName, base) {
  assertThrowsException(
    "rules must be arrays",
    function () {
      var x, rules = _.clone(base);
      rules[ruleName] = "not an array";
      x = new JsContract(rules, function () {});
    }
  );
  assertThrowsException(
    "rules must be arrays of strings",
    function () {
      var x, rules = _.clone(base);
      rules[ruleName] = ["ok", {"not": "ok"}];
      x = new JsContract(rules, function () {});
    }
  );
  assertDoesntThrowException(
    "rules must be an object containing an array of rules",
    function () {
      var x, rules = _.clone(base);
      rules[ruleName] = ["true"];
      x = new JsContract(rules, function () {});
    }
  );
  assertThrowsException(
    "rules must not be null",
    function () {
      var x, rules = _.clone(base);
      rules[ruleName] = null;
      x = new JsContract(rules, function () {});
    }
  );
};
_([["pre", {}], 
   ["post", {}], 
   ["invariant", {isConstructor: true}]]
 ).forEach(function (ruleSet) {
   testRules.apply(this, ruleSet);  
 });
assertThrowsException(
  "isConstructor must not be something other than a boolean",
  function () {
    var x = new JsContract({isConstructor: "", pre: ["true"]}, function () {});
  }
);
assertThrowsException(
  "throwEnsures must not be null",
  function () {
    var x = new JsContract({throwEnsures: null}, function () {});
  }
);
assertThrowsException(
  "throwEnsures must be an array of arrays",
  function () {
    var x = new JsContract({throwEnsures: [""]}, function () {});
  }
);
assertThrowsException(
  "throwEnsures must be an array of arrays of length 2",
  function () {
    var x = new JsContract({throwEnsures: [["", ""], ["", "", ""]]}, 
      function () {});
  }
);
assertDoesntThrowException(
  "throwEnsures must be an array of arrays of length 2",
  function () {
    var x = new JsContract({throwEnsures: [["", ""], ["", ""]]}, 
      function () {});
  }
);
assertThrowsException(
  "a function must be passed as the second argument",
  function () {
    var x = new JsContract({throwEnsures: [["", ""], ["", "", ""]]}, {});
  }
);

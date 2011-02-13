/*jslint white: false, onevar: true, undef: true, 
         newcap: true, nomen: false, regexp: true, plusplus: true, 
         bitwise: true, evil: true, maxerr: 5, maxlen: 80 */
/*global JsContract: false, _: false, Person: true, console, 
  assertThrowsException, assertDoesntThrowException, 
  assertThrowsExceptionOfType */
var personTest = function () {
  Person = new JsContract({
      isConstructor: true,
      invariant: [
        "name !== null",
        "name !== undefined",
        "name.length > 0"
      ]
    },
    function (name) {
      this.name = name; 
    }
  );
  
  Person.prototype.getName = new JsContract({
      post: [
        "result === this.name",
        "this.name === old(this.name)"
      ]
    },
    function () {
      return this.name;
    }
  );
  Person.prototype.setName = 
    new JsContract({
        pre: [
          "name !== null",
          "name !== undefined",
          "name.length > 0",
          "name !== this.getName()"
        ],
        post: [
          "this.getName() == name",
          "this.getName() !== old(this.getName())"
        ]
      },
      function (name) {
        this.name = name;
      }
    );
  
  Person.prototype.testExceptionOk = new JsContract({
      throwEnsures: [
        ["SyntaxError", "true"]
      ]
    },
    function () {
      throw new SyntaxError("bad syntax");
    });
  Person.prototype.testExceptionBad = new JsContract({
      throwEnsures: [
        ["SyntaxError", "true"]
      ]
    },
    function () {
      throw new Error("bad syntax");
    });
  
  assertThrowsException("Create person with no argument, expect rule to fail", 
    function () {
      var p = new Person();
      p = p;
    }
  );
  var p = new Person("Bob");
  assertDoesntThrowException(
    "getName on a properly instantiated Person should pass", 
    function () {
      p.getName();
    });
  assertThrowsException(
    "setName with a null argument will fail", 
    function () {
      p.setName(null);
    });
  assertThrowsException(
    "setName with no argument will fail", 
    function () {
      p.setName();
    });
  assertThrowsException(
    "setName with an empty argument should fail", 
    function () {
      p.setName("");
    });
  assertDoesntThrowException(
    "setName with a non-empty string should pass", 
    function () {
      p.setName("Jim");
    });
  assertThrowsException(
    "setName called with the same name twice should fail", 
    function () {
      p.setName("Jim");
    });
  assertThrowsExceptionOfType(
    "Calling textExceptionOk should pass", 
    function () {
      p.testExceptionOk();
    },
    SyntaxError);
  assertThrowsException(
    "Calling textExceptionBad should fail", 
    function () {
      p.testExceptionBad();
    });
};

try {
  personTest();
}
catch (e) {
  console.debug(e);
}

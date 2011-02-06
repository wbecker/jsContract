var personTest = function () {
  Person = 
    new jsContract({
        constructor: true,
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
  
  Person.prototype.getName = 
    new jsContract({
        post: [
          "result == this.name"
        ]
      },
      function () {
        return this.name;
      }
    );
  Person.prototype.setName = 
    new jsContract({
        pre: [
          "name !== null",
          "name !== undefined",
          "name.length > 0"
        ],
        post: [
          "this.getName() == name"
        ]
      },
      function (name) {
        this.name = name;
      }
    );
  
  Person.prototype.testExceptionOk = 
    new jsContract ({
      throwEnsures: [
        ["SyntaxError", "true"]
      ]
    },
    function () {
      throw new SyntaxError("bad syntax");
    });
  Person.prototype.testExceptionBad = 
    new jsContract ({
      throwEnsures: [
        ["SyntaxError", "true"]
      ]
    },
    function () {
      throw new Error("bad syntax");
    });
  
  assertThrowsException("Create person with no argument, expect rule to fail", 
    function () {
    new Person();
  });
  var p = new Person("Bob");
  assertDoesntThrowException("getName on a properly instantiated Person should pass", 
    function () {
      p.getName();
    });
  assertThrowsException("setName with a null argument will fail", 
    function () {
      p.setName(null);
    });
  assertThrowsException("setName with no argument will fail", 
    function () {
      p.setName();
    });
  assertThrowsException("setName with an empty argument should fail", 
    function () {
      p.setName("");
    });
  assertDoesntThrowException("setName with a non-empty string should pass", 
    function () {
      p.setName("Jim");
    });
  assertDoesntThrowException("Calling textExceptionOk should pass", 
    function () {
      p.testExceptionOk();
    });
  assertThrowsException("Calling textExceptionBad should fail", 
    function () {
      p.testExceptionBad();
    });
}

try {
  personTest();
}
catch (e) {
  console.debug(e);
}

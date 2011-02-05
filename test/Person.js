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

var test = function (f) {
  try {
    f();
  }
  catch (e) {
    console.debug(e);
  }
}
test(function () {
  console.debug("Create person with no argument, expect rule to fail");
  new Person();
});
var p = new Person("Bob");
test(function () {
  console.debug("getName on a properly instantiated Person should pass");
  p.getName();
});
test(function () {
  console.debug("setName with a null argument will fail");
  p.setName(null);
});
test(function () {
  console.debug("setName with no argument will fail");
  p.setName();
});
test(function () {
  console.debug("setName with an empty argument should fail");
  p.setName("");
});
test(function () {
  console.debug("setName with a non-empty string should pass");
  p.setName("Jim");
});
test(function () {
  console.debug("Calling textExceptionOk should pass");
  p.testExceptionOk();
});
test(function () {
  console.debug("Calling textExceptionBad should fail");
  p.testExceptionBad();
});

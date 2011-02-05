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

var test = function (f) {
  try {
    f();
  }
  catch (e) {
    console.debug(e);
  }
}
test(function () {
  new Person();
});
var p = new Person("Bob");
test(function () {
  p.getName();
});
test(function () {
  p.setName(null);
});
test(function () {
  p.setName();
});
test(function () {
  p.setName("");
});
test(function () {
  p.setName("Jim");
});


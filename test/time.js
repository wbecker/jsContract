var time = function () {
};

time.prototype.setHour = 
  new jsContract({
    pre:[
      "hour >= 0", 
      "hour <= 23"
    ]}, 
    function (hour) {
      this.hour = hour;
    }
  );

time.prototype.getHour = 
  new jsContract({
    post:[
      "result >= 0", 
      "result <= 23"
    ]}, 
    function () {
      return this.hour;
    }
  );

var t = new time();
var test = function (f) {
  try {
    f();
  }
  catch (e) {
    console.debug(e);
  }
}

test(function () {
  console.debug("set hour to -1, expect rule to fail");
  t.setHour(-1);
});
test(function () {
  console.debug("set hour to 0, expect rule to pass");
  t.setHour(0);
});
test(function () {
  console.debug("set hour to 23, expect rule to pass");
  t.setHour(23);
});
test(function () {
  console.debug("set hour to 24, expect rule to fail");
  t.setHour(24);
});

test(function () {
  t.hour=-1;
  console.debug("get hour when hour is -1, expect rule to fail");
  t.getHour();
});
test(function () {
  t.hour=0;
  console.debug("get hour when hour is 0, expect rule to pass");
  t.getHour();
});
test(function () {
  t.hour=23;
  console.debug("get hour when hour is 23, expect rule to pass");
  t.getHour();
});
test(function () {
  t.hour=24;
  console.debug("get hour when hour is 24, expect rule to fail");
  t.getHour();
});

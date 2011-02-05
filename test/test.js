var time = function () {
};

time.prototype.setHour = new jsContract(["hour >= 0", "hour < 24"], function (hour) {
  this.hour = hour;
});

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
  t.setHour(-1);
});
test(function () {
  t.setHour(0);
});
test(function () {
  t.setHour(23);
});
test(function () {
  t.setHour(24);
});

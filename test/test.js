var time = function () {
};

time.prototype.setHour = new jsContract({pre:["hour >= 0", "hour <= 23"]}, function (hour) {
  this.hour = hour;
});

time.prototype.getHour = new jsContract({post:["result >= 0", "result <= 23"]}, function () {
  return this.hour;
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

test(function () {
  t.hour=-1;
  t.getHour();
});
test(function () {
  t.hour=0;
  t.getHour();
});
test(function () {
  t.hour=23;
  t.getHour();
});
test(function () {
  t.hour=24;
  t.getHour();
});

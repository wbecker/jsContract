var time = function () {
};

time.prototype.setHour = new jsContract(["hour >= 0"], function (hour) {
  this.hour = hour;
});

/*jslint white: true, onevar: true, undef: true, newcap: true, 
         nomen: false, regexp: true, plusplus: true, bitwise: true, 
         maxerr: 5, maxlen: 80, indent: 2 */
/*global JsContract: false, _: false, Time: true, assertThrowsException, 
         assertDoesntThrowException, console */
var timeTest = function () {
  var Time = function () {};
  
  Time.prototype.setHour = new JsContract({
      pre: [
        "hour >= 0", 
        "hour <= 23"
      ]
    }, 
    function (hour) {
      this.hour = hour;
    }
  );
    
  Time.prototype.getHour = new JsContract({
      post: [
        "result >= 0", 
        "result <= 23"
      ]
    }, 
    function () {
      return this.hour;
    }
  );
  
  (function () {
    var t = new Time();
    assertThrowsException(
      "set hour to -1, expect rule to fail", 
      function () {
        t.setHour(-1);
      });
    assertDoesntThrowException(
      "set hour to 0, expect rule to pass", 
      function () {
        t.setHour(0);
      });
    assertDoesntThrowException(
      "set hour to 23, expect rule to pass", 
      function () {
        t.setHour(23);
      });
    assertThrowsException(
      "set hour to 24, expect rule to fail", 
      function () {
        t.setHour(24);
      });
  
    assertThrowsException(
      "get hour when hour is -1, expect rule to fail", 
      function () {
        t.hour = -1;
        t.getHour();
      });
    assertDoesntThrowException(
      "get hour when hour is 0, expect rule to pass", 
      function () {
        t.hour = 0;
        t.getHour();
      });
    assertDoesntThrowException(
      "get hour when hour is 23, expect rule to pass", 
      function () {
        t.hour = 23;
        t.getHour();
      });
    assertThrowsException(
      "get hour when hour is 24, expect rule to fail", 
      function () {
        t.hour = 24;
        t.getHour();
      });
  }());
};
try {
  timeTest();
}
catch (e) {
  console.debug(e);
}

contractsOn = true;
jsContract = function (rules, fn) {
  if (!contractsOn) {
    return fn;
  }
  else {
    return this.applyContract(rules, fn);
  }
};
jsContract.prototype.applyContract = function (rules, fn) {
  this.paramNames = this.getParamNames(fn);
  var processedRules = rules.map(this.processRule, this);
};
jsContract.prototype.getParamNames = function (fn) {
  var reg, params, paramNames;
  reg = /\(([\s\S]*?)\)/;
  params = reg.exec(fn);
  if (params) {
    paramNames = params[1].split(',');
  }
  else {
    paramNames = [];
  }
  return paramNames;
};
jsContract.prototype.processRule = function (rule) {
  console.debug(rule);
  return function () {
    eval(rule);
  };
};

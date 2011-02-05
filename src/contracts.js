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
  this.paramMap = this.getParamMap(fn);
  var preRules;
  if (rules.pre) {
    preRules = rules.pre.map(this.processRule, this);
  }
  else {
    preRules = [];
  }
  return function () {
    var that = this;
    var args = arguments;
    preRules.forEach(function (rule) {
      rule.apply(that, args);
    });
  };
};
jsContract.prototype.getParamMap = function (fn) {
  var reg, params, paramNames, paramMap;
  reg = /\(([\s\S]*?)\)/;
  params = reg.exec(fn);
  if (params) {
    paramNames = params[1].split(',');
  }
  else {
    paramNames = [];
  }
  paramMap = {};
  paramNames.forEach(function (paramName, index) {
    paramMap[paramName] = index; 
  });
  return paramMap;
};
jsContract.prototype.processRule = function (rule) {
  var paramName, regEx, transformedRule;
  transformedRule = rule;
  for (paramName in this.paramMap) {
    regEx = new RegExp(paramName, "g");
    transformedRule = transformedRule.replace(regEx, 
      "arguments["+this.paramMap[paramName]+"]");
  }
  return function () {
    var result = eval(transformedRule);
    if (!result) {
      throw "Rule failed: "+rule;
    }
  };
};

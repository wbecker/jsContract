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
  var preRules, postRules;
  if (rules.pre) {
    preRules = rules.pre.map(this.processRule, this);
  }
  else {
    preRules = [];
  }
  if (rules.post) {
    postRules = rules.post.map(this.processRule, this);
  }
  else {
    postRules = [];
  } 
  return function () {
    var that = this;
    var args = arguments;
    var result;
    preRules.forEach(function (rule) {
      rule.apply(that, [args, result]);
    });
    result = fn.apply(that, args);
    postRules.forEach(function (rule) {
      rule.apply(that, [args, result]);
    });
    return result;
  };
};
jsContract.prototype.getParamMap = function (fn) {
  var reg, params, paramNames, paramMap;
  reg = /\(([\s\S]*?)\)/;
  params = reg.exec(fn);
  if (params && (params[1] !== "")) {
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
      "args["+this.paramMap[paramName]+"]");
  }
  return function (args, result) {
    var ruleResult = eval(transformedRule);
    if (!ruleResult) {
      throw "Rule failed: "+rule;
    }
  };
};

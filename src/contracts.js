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
  var isConstructor, invariantRules, preRules, postRules, throwRules;
  this.paramMap = this.getParamMap(fn);
  isConstructor = !!rules.constructor;
  if (isConstructor) {
    if (rules.invariant) {
      invariantRules = rules.invariant.map(this.processRule, this);
    }
    else {
      invariantRules = [];
    }
    this.__invariantRules = invariantRules;
  }
  else {
    invariantRules = this.__invariantRules;
  }
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
  if (rules.throwEnsures) {
    throwRules = rules.throwEnsures.map(this.processThrowRule, this);
  }
  else {
    throwRules = [];
  }
  return function () {
    var that, args, result, ex;
    that = this;
    args = arguments;
    if (!isConstructor) {
      invariantRules.forEach(function (rule) {
        rule.apply(that, [args, result]);
      });
    }
    preRules.forEach(function (rule) {
      rule.apply(that, [args, result]);
    });
    try {
      result = fn.apply(that, args);
    }
    catch (e) {
      ex = e;
    }
    invariantRules.forEach(function (rule) {
      rule.apply(that, [args, result]);
    });
    if (!ex) {
      postRules.forEach(function (rule) {
        rule.apply(that, [args, result]);
      });
    }
    else {
      throwRules.forEach(function (rule) {
        rule.apply(that, [args, ex]);
      });
    }
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
  var transformedRule = this.transformRule(rule);
  return this.applyRule(rule, transformedRule);
};
jsContract.prototype.processThrowRule = function (rule) {
  var transformedRule = this.transformRule(rule[1]);
  return this.applyExceptionRule(rule[1], rule[0], transformedRule);
};
jsContract.prototype.transformRule = function (rule) {
  var paramName, regEx, transformedRule;
  transformedRule = rule;
  for (paramName in this.paramMap) {
    regEx = new RegExp(paramName, "g");
    transformedRule = transformedRule.replace(regEx, 
      "args["+this.paramMap[paramName]+"]");
  }
  return transformedRule;
};
jsContract.prototype.applyRule = function (rule, transformedRule) {
  return function (args, result) {
    var ruleResult = eval(transformedRule);
    if (!ruleResult) {
      throw "Rule failed: "+rule;
    }
  };
};
jsContract.prototype.applyExceptionRule = function (
    rule, exceptionType, transformedRule) {
  return function (args, ex) {
    var ruleResult = eval(transformedRule);
    if (ruleResult) {
      if (!(eval("ex instanceof "+exceptionType))) {
        throw "Rule failed: when "+rule+", throw "+exceptionType;
      }
    }
  };
};

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
    invariantRules = this.processRuleSet(rules.invariant);
    this.__invariantRules = invariantRules;
  }
  else {
    invariantRules = this.__invariantRules;
  }
  preRules = this.processRuleSet(rules.pre);
  postRules = this.processRuleSet(rules.post);
  throwRules = this.processRuleSet(rules.throwEnsures, this.processThrowRule);
  return this.applyRules(fn, isConstructor, preRules, postRules, invariantRules, 
    throwRules);
};
jsContract.prototype.processRuleSet = function (ruleSet, ruleProcessor) {
  var processedRules, ruleProcessorToApply;
  ruleProcessorToApply = ruleProcessor ? ruleProcessor : this.processRule;
  return ruleSet ?  ruleSet.map(ruleProcessorToApply, this) : [];
};
jsContract.prototype.applyRules = function (
    fn, isConstructor, preRules, postRules, invariantRules, throwRules) {
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

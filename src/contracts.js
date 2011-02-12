contractsOn = true;
jsContract = function (rules, fn) {
  if (!contractsOn) {
    return fn;
  }
  else {
    return this.applyContract(rules, fn);
  }
};
jsContract.execId = 0;
jsContract.prototype.applyContract = function (rules, fn) {
  var isConstructor, invariantRules, preRules, postRules, throwRules;
  this.paramMap = this.getParamMap(fn);
  isConstructor = !!rules.constructor;
  if (isConstructor) {
    invariantRules = this.processRuleSet(rules.invariant, this.processRule);
    this.__invariantRules = invariantRules;
  }
  else {
    invariantRules = this.__invariantRules;
  }
  preRules = this.processRuleSet(rules.pre, this.processRule);
  postRules = this.processRuleSet(rules.post, this.processRuleWithOld);
  throwRules = this.processRuleSet(rules.throwEnsures, this.processThrowRule);
  return this.applyRules(fn, isConstructor, preRules, postRules, invariantRules, 
    throwRules);
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
jsContract.prototype.processRuleSet = function (ruleSet, ruleProcessor) {
  return ruleSet ?  ruleSet.map(ruleProcessor, this) : [];
};
jsContract.prototype.processRule = function (rule) {
  var transformedRule = this.transformRule(rule);
  return this.createRuleApplier(rule, transformedRule);
};
jsContract.prototype.processRuleWithOld = function (rule) {
  var transformedRule, requiredOldValues, ruleApplier;
  transformedRule = this.transformRule(rule);
  requiredOldValues = this.gatherRequiredOldValues(transformedRule);
  transformedRule = this.updateRuleForOldValues(transformedRule, 
    requiredOldValues);
  ruleApplier = this.createRuleApplier(rule, transformedRule);
  ruleApplier.requiredOldValues = requiredOldValues;
  return ruleApplier;
};
jsContract.prototype.gatherRequiredOldValues = function (rule) {
  var regEx, match, requiredOldValues;
  regEx = /old\(/g;
  match = regEx.exec(rule);
  requiredOldValues = [];
  while (match) {
    requiredOldValues.push(jsContract.getOldValues(regEx, rule));
    match = regEx.exec(rule);
  }
  return requiredOldValues;
};
jsContract.getOldValues = function (regEx, rule) {
  var open, start, i, text, value;
  open = 1;
  start = regEx.lastIndex;
  i = start;
  while ((open > 0) && (i < rule.length)) {
    if (rule[i] === "(") {
      open++;
    }
    else if (rule[i] === ")") {
      open--;
    }
    i++;
  }
  if ((open > 0) && (i===rule.length)) {
    throw new Error("parentheses do no match in rule: \""+rule+"\"");
  }
  text = rule.substring(start-4, i);
  value = text.substring(4,text.length-1);
  regEx.lastIndex = i;
  return [text, value];
};
jsContract.prototype.updateRuleForOldValues = function (rule, 
  requiredOldValues) {
  var transformedRule = rule;
  requiredOldValues.forEach(function (requiredOldValue) {
    var oldValue, newValue;
    oldValue = requiredOldValue[0];
    newValue = "__oldVals__[\""+requiredOldValue[1]+"\"+this.__execId]";
    transformedRule = transformedRule.replace(oldValue, newValue);
  });
  return transformedRule;
};
jsContract.prototype.createRuleApplier = function (rule, transformedRule) {
  return function (args, result) {
    var ruleResult = eval(transformedRule);
    if (!ruleResult) {
      throw "Rule failed: "+rule;
    }
  };
};
jsContract.prototype.processThrowRule = function (rule) {
  var transformedRule = this.transformRule(rule[1]);
  return this.createExceptionRuleApplier(rule[1], rule[0], transformedRule);
};
jsContract.prototype.createExceptionRuleApplier = function (
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
jsContract.prototype.transformRule = function (rule) {
  var paramName, regEx, transformedRule;
  transformedRule = rule;
  for (paramName in this.paramMap) {
    if (this.paramMap.hasOwnProperty(paramName)) {
      regEx = new RegExp(paramName, "g");
      transformedRule = transformedRule.replace(regEx, 
        "args["+this.paramMap[paramName]+"]");
    }
  }
  return transformedRule;
};
jsContract.prototype.applyRules = function (
    fn, isConstructor, preRules, postRules, invariantRules, throwRules) {
  var jsContractContext = this;
  return function () {
    var that, args, result, ex;
    this.__execId = jsContract.execId;
    jsContract.execId++;
    that = this;
    args = arguments;
    if (!isConstructor) {
      jsContract.applyRuleSet(invariantRules, that, args);
    }
    jsContract.applyRuleSet(preRules, that, args);
    jsContractContext.gatherRequiredValues(postRules, that, args, this.__execId);
    try {
      result = fn.apply(that, args);
    }
    catch (e) {
      ex = e;
    }
    jsContract.applyRuleSet(invariantRules, that, args);
    if (!ex) {
      jsContract.applyRuleSet(postRules, that, args, result);
      return result;
    }
    else {
      jsContract.applyRuleSet(throwRules, that, args, ex);
      throw ex;
    }
  };
};
jsContract.applyRuleSet = function (ruleSet, that, args, result) {
  ruleSet.forEach(function (rule) {
    rule.apply(that, [args, result]);
  });
};
jsContract.prototype.gatherRequiredValues = function (ruleSet, that, args, execId) {
  if (ruleSet.length === 0) {
    return;
  }
  __oldVals__ = {};
  ruleSet.forEach(function (rule) {
    if ((rule.requiredOldValues) && (rule.requiredOldValues.length > 0)) {
      rule.requiredOldValues.forEach(function (requiredOldValue) {
        _.bind(function () {
          __oldVals__[requiredOldValue[1]+execId] = eval(requiredOldValue[1]);
        }, that)();
      });
    }
  });
};

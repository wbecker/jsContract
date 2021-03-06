/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: false, regexp: true, plusplus: true, bitwise: true, evil: true, maxerr: 5, maxlen: 80, indent: 2 */
/*global JsContract: true, _: false */
JsContract = function (rules, fn) {
  if (!JsContract.contractsOn) {
    return fn;
  } else {
    return this.applyContract(rules, fn);
  }
};
JsContract.contractsOn = true;
JsContract.execId = 0;
JsContract.prototype.applyContract = function (rules, fn) {
  var isConstructor, invariantRules, preRules, postRules, throwRules;
  this.paramMap = this.getParamMap(fn);
  isConstructor = !!rules.constructor;
  if (isConstructor) {
    invariantRules = this.processRuleSet(rules.invariant, this.processRule);
    this.__invariantRules = invariantRules;
  } else {
    invariantRules = this.__invariantRules;
  }
  preRules = this.processRuleSet(rules.pre, this.processRule);
  postRules = this.processRuleSet(rules.post, this.processRuleWithOld);
  throwRules = this.processRuleSet(rules.throwEnsures, this.processThrowRule);
  return this.applyRules(fn, isConstructor, preRules, postRules, 
    invariantRules, throwRules);
};
JsContract.prototype.getParamMap = function (fn) {
  var reg, params, paramNames, paramMap;
  reg = /\(([\s\S]*?)\)/;
  params = reg.exec(fn);
  if (params && (params[1] !== "")) {
    paramNames = params[1].split(',');
  } else {
    paramNames = [];
  }
  paramMap = {};
  paramNames.forEach(function (paramName, index) {
    paramMap[paramName.trim()] = index; 
  });
  return paramMap;
};
JsContract.prototype.processRuleSet = function (ruleSet, ruleProcessor) {
  return ruleSet ?  ruleSet.map(ruleProcessor, this) : [];
};
JsContract.prototype.processRule = function (rule) {
  var transformedRule = this.transformRule(rule);
  return this.createRuleApplier(rule, transformedRule);
};
JsContract.prototype.processRuleWithOld = function (rule) {
  var transformedRule, requiredOldValues, ruleApplier;
  transformedRule = this.transformRule(rule);
  requiredOldValues = this.gatherRequiredOldValues(transformedRule);
  transformedRule = this.updateRuleForOldValues(transformedRule, 
    requiredOldValues);
  ruleApplier = this.createRuleApplier(rule, transformedRule);
  ruleApplier.requiredOldValues = requiredOldValues;
  return ruleApplier;
};
JsContract.prototype.gatherRequiredOldValues = function (rule) {
  var regEx, match, requiredOldValues;
  regEx = /old\(/g;
  match = regEx.exec(rule);
  requiredOldValues = [];
  while (match) {
    requiredOldValues.push(this.getOldValues(regEx, rule));
    match = regEx.exec(rule);
  }
  return requiredOldValues;
};
JsContract.prototype.getOldValues = function (regEx, rule) {
  var open, start, i, text, value;
  open = 1;
  start = regEx.lastIndex;
  i = start;
  while ((open > 0) && (i < rule.length)) {
    if (rule[i] === "(") {
      open += 1;
    } else if (rule[i] === ")") {
      open -= 1;
    }
    i += 1;
  }
  if ((open > 0) && (i === rule.length)) {
    throw new Error("parentheses do no match in rule: \"" + rule + "\"");
  }
  text = rule.substring(start - 4, i);
  value = text.substring(4, text.length - 1);
  regEx.lastIndex = i;
  return [text, value];
};
JsContract.prototype.updateRuleForOldValues = function (rule, 
  requiredOldValues) {
  var transformedRule = rule;
  requiredOldValues.forEach(function (requiredOldValue) {
    var oldValue, newValue;
    oldValue = requiredOldValue[0];
    newValue = "JsContract.__oldVals__[\"" + requiredOldValue[1] + 
      "\" + this.__execId]";
    transformedRule = transformedRule.replace(oldValue, newValue);
  });
  return transformedRule;
};
JsContract.prototype.createRuleApplier = function (rule, transformedRule) {
  return function (args, result) {
    var ruleResult = eval(transformedRule);
    if (!ruleResult) {
      throw "Rule failed: " + rule;
    }
  };
};
JsContract.prototype.processThrowRule = function (rule) {
  var transformedRule = this.transformRule(rule[1]);
  return this.createExceptionRuleApplier(rule[1], rule[0], transformedRule);
};
JsContract.prototype.createExceptionRuleApplier = function (rule, 
  exceptionType, transformedRule) {
  return function (args, ex) {
    var ruleResult = eval(transformedRule);
    if (ruleResult) {
      if (!(eval("ex instanceof " + exceptionType))) {
        throw "Rule failed: when " + rule + ", throw " + exceptionType;
      }
    }
  };
};
JsContract.prototype.transformRule = function (rule) {
  var paramName, regEx, transformedRule;
  transformedRule = rule;
  for (paramName in this.paramMap) {
    if (this.paramMap.hasOwnProperty(paramName)) {
      regEx = new RegExp(paramName, "g");
      transformedRule = transformedRule.replace(regEx, 
        "args[" + this.paramMap[paramName] + "]");
    }
  }
  return transformedRule;
};
JsContract.prototype.applyRules = function (
    fn, isConstructor, preRules, postRules, invariantRules, throwRules) {
  var jsContractContext = this;
  return function () {
    var that, args, result, ex;
    this.__execId = JsContract.execId;
    JsContract.execId += 1;
    that = this;
    args = arguments;
    if (!isConstructor) {
      JsContract.applyRuleSet(invariantRules, that, args);
    }
    JsContract.applyRuleSet(preRules, that, args);
    jsContractContext.gatherRequiredValues(postRules, that, args, 
      this.__execId);
    try {
      result = fn.apply(that, args);
    }
    catch (e) {
      ex = e;
    }
    JsContract.applyRuleSet(invariantRules, that, args);
    if (!ex) {
      JsContract.applyRuleSet(postRules, that, args, result);
      return result;
    } else {
      JsContract.applyRuleSet(throwRules, that, args, ex);
      throw ex;
    }
  };
};
JsContract.applyRuleSet = function (ruleSet, that, args, result) {
  ruleSet.forEach(function (rule) {
    rule.apply(that, [args, result]);
  });
};
JsContract.prototype.gatherRequiredValues = function (ruleSet, that, args, 
    execId) {
  if (ruleSet.length === 0) {
    return;
  }
  JsContract.__oldVals__ = {};
  ruleSet.forEach(function (rule) {
    if ((rule.requiredOldValues) && (rule.requiredOldValues.length > 0)) {
      rule.requiredOldValues.forEach(function (requiredOldValue) {
        _.bind(function () {
          JsContract.__oldVals__[requiredOldValue[1] + execId] = 
            eval(requiredOldValue[1]);
        }, that)();
      });
    }
  });
};

(function () {
  var a = new JsContract({
    isConstructor: true,
    invariant: ["JsContract.execId >= 0"],
    pre: ["typeof(rules) === 'object'",
          //There must be either a pre, post, throwEnsures or 
          //both an isConstructor and invariant
          "!_.isUndefined(rules.pre) || !_.isUndefined(rules.post) || " +
            "!_.isUndefined(rules.throwEnsures) || " +
            "(!_.isUndefined(rules.isConstructor) && " +
            "!_.isUndefined(rules.invariant))",
          "_.isUndefined(rules.isConstructor) || " +
            "_.isBoolean(rules.isConstructor)",
          "_.isUndefined(rules.pre) || _.isArray(rules.pre)",
          "_.isUndefined(rules.pre) || _.all(rules.pre, _.isString)",
          "_.isUndefined(rules.post) || _.isArray(rules.post)",
          "_.isUndefined(rules.post) || _.all(rules.post, _.isString)",
          "_.isUndefined(rules.invariant) || _.isArray(rules.invariant)",
          "_.isUndefined(rules.invariant) || " +
            "_.all(rules.invariant, _.isString)",
          "_.isUndefined(rules.throwEnsures) || _.isArray(rules.throwEnsures)",
          "_.isUndefined(rules.throwEnsures) || " +
            "(_.all(rules.throwEnsures, _.isArray) && " +
            "_.all(rules.throwEnsures, function (x) {" +
            "return (x.length === 2) &&_.all(x, _.isString)}))",
          "_.isFunction(fn)"]
  }, JsContract);
  a.prototype = JsContract.prototype;
  a.contractsOn = JsContract.contractsOn;
  a.execId = JsContract.execId;
  a.applyRuleSet = JsContract.applyRuleSet;
  JsContract = a;
}());

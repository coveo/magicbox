/// <reference path="MagicBox.ts" />

/// <reference path="Result/Result.ts" />
/// <reference path="Result/EndOfInputResult.ts" />
/// <reference path="Result/OptionResult.ts" />
/// <reference path="Result/RefResult.ts" />

/// <reference path="Expression/Expression.ts" />
/// <reference path="Expression/ExpressionConstant.ts" />
/// <reference path="Expression/ExpressionEndOfInput.ts" />
/// <reference path="Expression/ExpressionFunction.ts" />
/// <reference path="Expression/ExpressionList.ts" />
/// <reference path="Expression/ExpressionOptions.ts" />
/// <reference path="Expression/ExpressionRef.ts" />
/// <reference path="Expression/ExpressionRegExp.ts" />

module Coveo.MagicBox {
  export class Grammar {
    public start: ExpressionRef;
    public expressions: { [id: string]: Expression } = {};

    constructor(start: string, expressions: { [id: string]: ExpressionDef } = {}) {
      this.start = new ExpressionRef(start, null, 'start', this);
      this.addExpressions(expressions);
    }

    public addExpressions(expressions: { [id: string]: ExpressionDef }) {
      _.each(expressions, (basicExpression: ExpressionDef, id: string) => {
        this.addExpression(id, basicExpression);
      });
    }

    public addExpression(id: string, basicExpression: ExpressionDef) {
      if (id in this.expressions) {
        throw 'Grammar already contain the id:' + id;
      }
      this.expressions[id] = Grammar.buildExpression(basicExpression, id, this);
    }

    public getExpression(id: string) {
      return this.expressions[id];
    }

    public parse(value: string) {
      return this.start.parse(value, true);
    }

    public static buildExpression(value: ExpressionDef, id: string, grammar: Grammar): Expression {
      var type = typeof value;
      if (type == 'undefined') {
        throw 'Invalid Expression: ' + value;
      }
      if (_.isString(value)) {
        return this.buildStringExpression(<string>value, id, grammar);
      }
      if (_.isArray(value)) {
        return new ExpressionOptions(_.map(<string[]>value, (v: string, i) => new ExpressionRef(v, null, id + '_' + i, grammar)), id);
      }
      if (_.isRegExp(value)) {
        return new ExpressionRegExp(<RegExp>value, id, grammar);
      }
      if (_.isFunction(value)) {
        return new ExpressionFunction(<ExpressionFunctionArgument>value, id, grammar);
      }
      throw 'Invalid Expression: ' + value;
    }

    public static buildStringExpression(value: string, id: string, grammar: Grammar): Expression {
      var matchs = Grammar.stringMatch(value, Grammar.spliter);
      var expressions = _.map(matchs, (match: string[], i: number): Expression => {
        if (match[1]) { // Ref
          var ref = match[1];
          var occurrence = match[3] ? Number(match[3]) : match[2] || null;
          return new ExpressionRef(ref, occurrence, id + '_' + i, grammar);
        } else { // Constant
          return new ExpressionConstant(match[4], id + '_' + i)
        }
      });
      if (expressions.length == 1) {
        var expression = expressions[0];
        expression.id = id;
        return expression;
      } else {
        return new ExpressionList(expressions, id);
      }
    }

    public static stringMatch(str: string, re: RegExp) {
      var groups: string[][] = [];
      var group: RegExpExecArray;
      var cloneRegExp = new RegExp(re.source, 'g');
      while ((group = cloneRegExp.exec(str)) !== null) {
        groups.push(group);
      }
      return groups;
    }

    static spliter = /\[(\w+)(\*|\+|\?|\{([1-9][0-9]*)\})?\]|(.[^\[]*)/;
  }
}

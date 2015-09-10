/// <reference path="GrammarResult.ts" />
/// <reference path="GrammarExpressionConstant.ts" />
/// <reference path="GrammarExpressionList.ts" />
/// <reference path="GrammarExpressionOptions.ts" />
/// <reference path="GrammarExpressionRef.ts" />
/// <reference path="GrammarExpressionRegExp.ts" />
/// <reference path="GrammarExpressionStart.ts" />

module Coveo.MagicBox {
  export type GrammarExpressionDef = GrammarExpressionDefSimple|GrammarExpressionDefSimple[];
  export type GrammarExpressionDefSimple = RegExp|string;

  export interface GrammarExpression {
    id: string;
    parse?:(value: string)=>GrammarResult;
  }

  export class Grammar {
    public start: GrammarExpressionStart;
    public expressions: { [id: string]: GrammarExpression } = {};

    constructor(start: string, expressions: { [id: string]: GrammarExpressionDef } = {}, ...extendsGrammars: Grammar[]) {
      this.start = new GrammarExpressionStart(start, this);
      this.addExpressions(expressions);
      _.each(extendsGrammars, (grammar) => {
        _.each(grammar.expressions, (expression, id) => {
          if (!(id in this.expressions)) {
            this.expressions[id] = expression;
          }
        });
      });
    }

    public addExpressions(expressions: { [id: string]: GrammarExpressionDef }) {
      _.forEach(expressions, (basicExpression: GrammarExpressionDef, id: string) => {
        if (id in this.expressions) {
          throw 'Grammar already contain the id:' + id;
        }
        this.expressions[id] = Grammar.buildExpression(basicExpression, id, this);
      });
    }

    public getExpression(id: string) {
      return this.expressions[id];
    }

    public parse(value: string) {
      var result = this.start.parse(value);
      return result;
    }

    public static buildExpression(value: GrammarExpressionDef, id: string, grammar: Grammar): GrammarExpression {
      var type = typeof value;
      if (type == 'undefined') {
        throw 'Invalid GrammarExpression: ' + value;
      }
      if (_.isString(value)) {
        return this.buildStringExpression(<string>value, id, grammar);
      }
      if (_.isArray(value)) {
        return new GrammarExpressionOptions(_.map(<string[]>value, (v: string, i) => new GrammarExpressionRef(v, null, null, id + '_' + i, grammar)), id, grammar);
      }
      if (_.isRegExp(value)) {
        return new GrammarExpressionRegExp(<RegExp>value, id, grammar);
      }
      throw 'Invalid GrammarExpression: ' + value;
    }

    public static buildStringExpression(value: string, id: string, grammar: Grammar): GrammarExpression {
      var matchs = Grammar.stringMatch(value, Grammar.spliter);
      var expressions = _.map(matchs, (match, i) => {
        if (match[1] != null) { // Ref
          var ref = match[1];
          var occurrence = match[3] || match[2];
          var separator = match[4];
          return new GrammarExpressionRef(ref, occurrence, separator, id + '_' + i, grammar);
        } else { // Constant
          return new GrammarExpressionConstant(match[5], id + '_' + i)
        }
      });

      if (expressions.length == 1) {
        var expression = expressions[0];
        expression.id = id;
        return expression;
      } else {
        return new GrammarExpressionList(expressions, id, grammar);
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

    static spliter = /\[(\w+)(([\*\+])(\w+)?|\?)?\]|(.[^\[]*)/;
  }
}
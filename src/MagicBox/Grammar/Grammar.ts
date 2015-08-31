/// <reference path="../../underscore.d.ts" />
/// <reference path="GrammarExpressionConstant.ts" />
/// <reference path="GrammarExpressionList.ts" />
/// <reference path="GrammarExpressionOptions.ts" />
/// <reference path="GrammarExpressionRef.ts" />
/// <reference path="GrammarExpressionRegExp.ts" />

module coveo {
  export type GrammarExpressionDef = GrammarExpressionDefSimple|GrammarExpressionDefSimple[];
  export type GrammarExpressionDefSimple = RegExp|string;

  export interface GrammarExpression {
    id: string;
    parse(value: string): GrammarResult;
  }

  export interface GrammarResult {
    value: string;
    expression: GrammarExpression;
    subResults?: GrammarResult[];
    groups?: RegExpMatchArray;
  }

  export class Grammar {

    public start: GrammarExpression;
    public expressions: { [id: string]: GrammarExpression } = {};

    constructor(start: GrammarExpressionDef, expressions: { [id: string]: GrammarExpressionDef } = {}, ...extendsGrammars: Grammar[]) {
      this.start = this.buildExpression(start, 'start');
      this.addExpressions(expressions);
      _.each(extendsGrammars, (grammar) => {
        _.each(grammar.expressions, (expression, id) => {
          if (!(id in this.expressions)) {
            this.expressions[id] = expression;
          }
        })
      });
    }

    public addExpressions(expressions: { [id: string]: GrammarExpressionDef }) {
      _.forEach(expressions, (basicExpression: GrammarExpressionDef, id: string) => {
        if (id in this.expressions) {
          throw 'Grammar already contain the id:' + id;
        }
        this.expressions[id] = this.buildExpression(basicExpression, id);
      });
    }

    public getExpression(id: string) {
      return this.expressions[id];
    }

    public parse(value: string): GrammarResult {
      return this.start.parse(value);
    }

    public buildExpression(value: GrammarExpressionDef, id: string): GrammarExpression {
      var type = typeof value;
      if (type == 'undefined') {
        throw 'Invalid GrammarExpression: ' + value;
      }
      if (_.isString(value)) {
        return this.buildStringExpression(<string>value, id);
      }
      if (_.isArray(value)) {
        return new GrammarExpressionOptions(_.map(<GrammarExpressionDefSimple[]>value, (v, i) => this.buildExpression(v, id + '_' + i)), id, this);
      }
      if (_.isRegExp(value)) {
        return new GrammarExpressionRegExp(<RegExp>value, id, this);
      }
      throw 'Invalid GrammarExpression: ' + value;
    }

    public buildStringExpression(value: string, id: string): GrammarExpression {
      var matchs = this.stringMatch(value, Grammar.spliter);
      var expressions = _.map(matchs, (match, i) => {
        if (match[1] != null) { // Ref
          var ref = match[1];
          var occurrence = match[3] || match[2];
          var separator = match[4];
          return new GrammarExpressionRef(ref, occurrence, separator, id + '_' + i, this);
        } else { // Constant
          return new GrammarExpressionConstant(match[5], id + '_' + i)
        }
      });

      if (expressions.length == 1) {
        var expression = expressions[0];
        expression.id = id;
        return expression;
      } else {
        return new GrammarExpressionList(expressions, id, this);
      }
    }

    public stringMatch(str: string, re: RegExp) {
      var groups: string[][] = [];
      var group: RegExpExecArray;
      var cloneRegExp = new RegExp(re.source, 'g');
      while ((group = cloneRegExp.exec(str)) !== null) {
        groups.push(group);
      }
      return groups;
    }

    static spliter = /\[(\w+)(([\*\+])(\w+)?|\?)?\]|(.[^\[]*)/;

    public static resultToElement(result: GrammarResult, value: string): HTMLElement {
      var element = document.createElement('span');
      if (result == null) {
        element.appendChild(document.createTextNode(value))
        return element;
      }
      var id = result.expression != null ? result.expression.id : null;
      if (id != null) {
        var attId = document.createAttribute("data-id");
        attId.value = id;
        element.setAttributeNode(attId);
      }
      var attValue = document.createAttribute("data-value");
      attValue.value = result.value;
      element.setAttributeNode(attValue);
      if (result.subResults == null) {
        element.appendChild(document.createTextNode(result.value))
      } else {
        _.each(result.subResults, (subResult) => {
          element.appendChild(Grammar.resultToElement(subResult, ''));
        });
      }
      element['result'] = result;
      return element;
    }

    public static resultToString(result: GrammarResult): string {
      if (result == null) {
        return '';
      }
      if (result.subResults == null) {
        return result.value;
      } else {
        return _.map(result.subResults, (subResult) => Grammar.resultToString(subResult)).join('');
      }
    }
  }
}
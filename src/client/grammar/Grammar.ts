/// <reference path="../underscore.d.ts" />
/// <reference path="GrammarExpressionConstant.ts" />
/// <reference path="GrammarExpressionList.ts" />
/// <reference path="GrammarExpressionOptions.ts" />
/// <reference path="GrammarExpressionRef.ts" />
/// <reference path="GrammarExpressionRegExp.ts" />

module coveo {
  export type GrammarBasicExpression = RegExp|string;

  export type GrammarExpressionString = GrammarExpressionOptions|GrammarExpressionRef|GrammarExpressionConstant;

  export interface GrammarExpression {
    id: string; // use for hightlight
    parse(value: string): GrammarResult;
  }

  export interface GrammarResult {
    value: string;
    id?: string;
    expression?: GrammarExpression;
    subResults?: GrammarResult[];
  }

  export class Grammar {

    private start: GrammarExpression;
    private expressions: { [id: string]: GrammarExpression } = {};

    public eatSpaces = true;

    constructor(start: GrammarBasicExpression, expressions: { [id: string]: GrammarBasicExpression } = {}, ...extendsGrammars: Grammar[]) {
      this.start = this.buildExpression(start, 'start');
      this.addExpressions(expressions);
      _.each(extendsGrammars, (grammar) => {
        _.each(grammar.expressions, (expression, id) => {
          if (!(id in this.expressions)) {
            this.expressions[id] = expression;
          }
        })
      })
    }

    public addExpressions(expressions: { [id: string]: GrammarBasicExpression }) {
      _.forEach(expressions, (basicExpression: GrammarBasicExpression, id: string) => {
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
      var result = this.start.parse(value);
      return result;
    }

    public buildExpression(value: GrammarBasicExpression, id: string): GrammarExpression {
      var type = typeof value;
      if (type == 'undefined') {
        throw 'Invalid GrammarExpression: ' + value;
      }
      if (type == 'string') {
        return this.buildStringExpression(<string>value, id);
      }
      if (type == 'object') {
        if (value instanceof RegExp) {
          return new GrammarExpressionRegExp(value, id, this);
        } else if (value instanceof String) {
          return this.buildStringExpression(<string>value, id);
        }
      }
      throw 'Invalid GrammarExpression: ' + value;
    }

    public buildStringExpression(value: string, id: string): GrammarExpression {
      var matchs = this.stringMatch(value, Grammar.spliter);
      var expressions = _.map(matchs, (match, i) => {
        if (match[1] != null) { // Ref
          return new GrammarExpressionRef(match[1], match[2], null, this);
        } else if (match[3] != null) { // Options
          return new GrammarExpressionOptions(GrammarExpressionOptions.stringToParts(match[3], this), null, this);
        } else { // Constant
          return new GrammarExpressionConstant(match[4], null)
        }
      })
      var mergedExpressions: GrammarExpression[] = []
      _.each(expressions, (expression: GrammarExpression) => {
        var last = <GrammarExpressionConstant>_.last(mergedExpressions);
        if (expression instanceof GrammarExpressionConstant && last != null && last instanceof GrammarExpressionConstant) {
          mergedExpressions.pop();
          mergedExpressions.push(new GrammarExpressionConstant(last.value + expression.value));
        } else {
          mergedExpressions.push(expression);
        }
      })
      if (mergedExpressions.length == 1) {
        var expression = expressions[0];
        expression.id = id;
        return expression;
      } else {
        return new GrammarExpressionList(expressions, id, this);
      }
    }

    public buildOptionsExpression(value: string) {
      var multiRef = value.split('|');
      if (multiRef.length > 1) {

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

    static ref = /(\w+)([\*\+\?])/;
    static spliter = /\[(\w+)([\*\+\?])?\]|\[(\w+(?:\|\w+)*)\]|(.[^\[\{]*)/;

    public static resultToElement(result: GrammarResult, value:string): HTMLElement {
      var element = document.createElement('span');
      if (result == null) {        
        element.appendChild(document.createTextNode(value))
        return element;
      }
      var id = result.expression != null ? result.expression.id : result.id;
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
  }
}
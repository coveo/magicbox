/// <reference path="Grammar.ts" />
module Coveo.MagicBox {

  export class GrammarResult {
    parent: GrammarResult;
    success: GrammarResultSuccess;
    fail: GrammarResultFail;

    constructor(public expression: GrammarExpression, public input: string) {
      this.success = this instanceof GrammarResultSuccess && <GrammarResultSuccess>this;
      this.fail = this instanceof GrammarResultFail && <GrammarResultFail>this;
    }

    hash() {
      return this.input + this.expression.id;
    }

    getExpect(): GrammarResultFail[] {
      return [];
    }
  }

  export class GrammarResultSuccess extends GrammarResult {
    constructor(public value: string | GrammarResultSuccess[], public expression: GrammarExpression, public input: string) {
      super(expression, input);
      var subResults = this.getSubResults();
      if (subResults != null) {
        _.each(subResults, (subResult)=> {
          subResult.parent = this;
        })
      }
    }

    getStringValue() {
      return _.isString(this.value) ? <string> this.value : null;
    }

    getSubResults() {
      return _.isArray(this.value) ? <GrammarResultSuccess[]>this.value : null;
    }

    toHtmlElement(): HTMLElement {
      var element = document.createElement('span');
      var id = this.expression != null ? this.expression.id : null;

      if (id != null) {
        var attId = document.createAttribute("data-id");
        attId.value = id;
        element.setAttributeNode(attId);
      }

      var value = this.getStringValue();
      if (value != null) {
        var attValue = document.createAttribute("data-value");
        attValue.value = value;
        element.setAttributeNode(attValue);
      }

      var subResults = this.getSubResults();
      if (subResults != null) {
        _.each(subResults, (subResult) => {
          element.appendChild(subResult.toHtmlElement());
        })
      } else {
        element.appendChild(document.createTextNode(<string>this.value))
      }
      element['result'] = this;
      return element;
    }

    toString(): string {
      var subResults = this.getSubResults();
      if (subResults != null) {
        return _.map(subResults, (subResult) => {
          return subResult.toString();
        }).join('');
      }
      return this.getStringValue() || '';
    }

    getLength(): number {
      var value = this.getStringValue();
      if (value != null) {
        return value.length;
      }
      var subResults = this.getSubResults();
      if (subResults != null) {
        return _.reduce(subResults, (sum, subResult: GrammarResultSuccess) => sum + subResult.getLength(), 0);
      }
      return 0;
    }

    flatResults() {
      var subResults = this.getSubResults();
      if (subResults != null) {
        return _.reduce(subResults, (results: GrammarResultSuccess[], subResult: GrammarResultSuccess) => {
          return results.concat(subResult.flatResults());
        }, []);
      }
      var value = this.getStringValue();
      if (value) {
        return [this];
      }
      return [];
    }
  }

  export class GrammarResultFail extends GrammarResult {
    public parent:GrammarResultFail;
    constructor(public subResults: GrammarResult[], public expression: GrammarExpression, public input: string) {
      super(expression, input);
      if (subResults != null) {
        _.each(subResults, (subResult)=> {
          subResult.parent = this;
        });
      }
    }

    getExpect(): GrammarResultFail[] {
      if (this.subResults == null) {
        return [this];
      }
      return <GrammarResultFail[]>_.chain(this.subResults)
          .reduce((results: GrammarResultFail[], subResult)=>results.concat(subResult.getExpect()), [])
          .uniq((expect: GrammarResultFail)=>expect.hash())
          .value();
    }

    getBestExpect(): GrammarResultFail[]{
      var expects = this.getExpect();
      var groups = _.groupBy(expects, function (expect) {
        return expect.input
      });
      var key = _.last(_.keys(groups).sort((a, b)=> {
        return b.length - a.length;
      }));
      return groups[key];
    }

    getHumanReadable() {
      if (this.expression instanceof GrammarExpressionConstant) {
        return JSON.stringify((<GrammarExpressionConstant>this.expression).value);
      }
      return this.expression.id;
    }

    getHumanReadableExpect() {
      var expects = this.getBestExpect();
      var input = expects.length > 0 ? _.last(expects).input : '';
      return 'Expected ' +
          _.map(expects, (value: GrammarResultFail)=> value.getHumanReadable()).join(' or ') +
          ' but ' +
          (input.length > 0 ? JSON.stringify(input[0]) : 'end of input') +
          ' found.';
    }
  }

  export class GrammarResultFailEndOfInput extends GrammarResultFail {
    constructor(subResults: GrammarResult[], public expression: GrammarExpression, input: string) {
      super(subResults, expression, input);
    }

    getExpect(): GrammarResultFail[] {
      if(this.subResults != null){
        return super.getExpect().concat([this]);
      }
      return super.getExpect();
    }

    getHumanReadable() {
      return 'end of input';
    }
  }
}
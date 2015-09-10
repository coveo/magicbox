/// <reference path="Grammar.ts" />
module Coveo.MagicBox {

  export class GrammarResult {
    success:GrammarResultSuccess;
    fail:GrammarResultFail;
    constructor(public expression: GrammarExpression, public input: string) {
      this.success = this instanceof GrammarResultSuccess && <GrammarResultSuccess>this;
      this.fail = this instanceof GrammarResultFail && <GrammarResultFail>this;
    }

    hash() {
      return this.input + this.expression.id;
    }
  }


  export class GrammarResultSuccess extends GrammarResult {
    constructor(public value: string | GrammarResultSuccess[], public expression: GrammarExpression, public input: string) {
      super(expression, input);
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
        return _.reduce(subResults, (sum, subResult:GrammarResultSuccess) => sum + subResult.getLength(), 0);
      }
      return 0;
    }
  }

  export class GrammarResultFail extends GrammarResult {
    constructor(private expect: boolean|GrammarResultFail[], public expression: GrammarExpression, public input: string) {
      super(expression, input);
    }

    getExpect(): GrammarResultFail[] {
      if(_.isArray(this.expect)){
        return <GrammarResultFail[]>this.expect;
      }
      return this.expect ? [this] : [];
    }

    getHumanReadableExpect() {
      var expects = _.uniq(this.getExpect(), (expect)=>expect.hash());
      var groups = _.groupBy(expects, function (expect) {
        return expect.input
      });
      return _.map(groups, (values, key: string)=> {
        return 'Expected ' + _.map(values, (value:GrammarResult)=> {
              if (value.expression instanceof GrammarExpressionConstant) {
                return JSON.stringify((<GrammarExpressionConstant>value.expression).value);
              }
              return value.expression.id;
            }).join(' or ') + ' but ' + (key.length > 0 ? JSON.stringify(key[0]) : 'end of input') +' found.';
      }).join(' ');
    }
  }
}
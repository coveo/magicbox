/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ResultSuccess extends Result {
    constructor(public value: string | ResultSuccess[], public expression: Expression, public input: string) {
      super(expression, input);
      var subResults = this.getSubResults();
      if (subResults != null) {
        _.each(subResults, (subResult) => {
          subResult.parent = this;
        })
      }
    }

    getStringValue() {
      return _.isString(this.value) ? <string> this.value : null;
    }

    getSubResults() {
      return _.isArray(this.value) ? <ResultSuccess[]>this.value : null;
    }

    toHtmlElement(): HTMLElement {
      var element = super.toHtmlElement();

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
        return _.reduce(subResults, (sum, subResult: ResultSuccess) => sum + subResult.getLength(), 0);
      }
      return 0;
    }

    flatResults(): ResultSuccess[] {
      var subResults = this.getSubResults();
      if (subResults != null) {
        return _.reduce(subResults, (results: ResultSuccess[], subResult: ResultSuccess) => {
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
}
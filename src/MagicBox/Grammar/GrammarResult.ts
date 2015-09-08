/// <reference path="Grammar.ts" />
module coveo {

  export class GrammarResult<T extends GrammarExpression> {
    public success: boolean = false;
    public expect: string[];

    constructor(public expression: T, public input:string) {
    }

    getValue(): string {
      return null;
    }

    getSubResults(): GrammarResult<GrammarExpression>[] {
      return null;
    }

    toHtmlElement(): HTMLElement {
      var element = document.createElement('span');
      var id = this.expression != null ? this.expression.id : null;
      if (id != null) {
        var attId = document.createAttribute("data-id");
        attId.value = id;
        element.setAttributeNode(attId);
      }

      var value = this.getValue();
      if (value) {
        var attValue = document.createAttribute("data-value");
        attValue.value = value;
        element.setAttributeNode(attValue);
      }

      var subResults = this.getSubResults();
      if (subResults != null) {
        _.each(subResults, (subResult) => {
          element.appendChild(subResult.toHtmlElement());
        })
      } else if (value) {
        element.appendChild(document.createTextNode(value))
      }

      element['result'] = this;
      return element;
    }

    getLength(): number {
      var value = this.getValue();
      if (value != null) {
        return value.length;
      }
      var subResults = this.getSubResults();
      if (subResults != null) {
        return _.reduce(subResults, (sum, subResult: GrammarResult<GrammarExpression>) => sum + subResult.getLength(), 0);
      }
      return 0;
    }

    getExpect():GrammarResult<GrammarExpression>[] {
      return [];
    }
    
    equal(result:GrammarResult<GrammarExpression>){
      return this.input == result.input && this.expression == result.expression;
    }
  }
}
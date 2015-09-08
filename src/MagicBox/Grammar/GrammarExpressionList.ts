module coveo {

  export class GrammarExpressionList implements GrammarExpression {
    constructor(private parts: GrammarExpression[], public id: string, private grammar: Grammar) {
    }

    parse(value: string) {
      var subResults: GrammarResult<GrammarExpression>[] = [];
      var currentValue = value;
      for (var i = 0; i < this.parts.length; i++) {
        var part = this.parts[i];
        var subResult = part.parse(currentValue);
        subResults.push(subResult);
        if (subResult.success) {
          currentValue = currentValue.substr(subResult.getLength());
        } else {
          break;
        }
      }
      return new GrammarResultList(subResults, this, value);
    }
  }

  export class GrammarResultList extends GrammarResult<GrammarExpressionList> {
    constructor(public subResults: GrammarResult<GrammarExpression>[], expression: GrammarExpressionList, public input:string) {
      super(expression, input);
      this.success = _.last(subResults).success;
    }

    getSubResults() {
      return this.subResults;
    }
    
    getExpect() {
      return _.last(this.subResults).getExpect();
    }
  }
}
module coveo {
  export class GrammarExpressionRef implements GrammarExpression {
    constructor(public ref:string, public occurance: string, public id: string, private grammar: Grammar) {
    }

    parse(value: string): GrammarResult {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'GrammarExpression not found:' + this.ref
      }
      var result: GrammarResult;
      if (this.occurance == '?' || this.occurance == null) {
        result = ref.parse(value);
        if (result == null && this.occurance == '?') {
          return {
            value: '',
            expression: this
          }
        }
        return result
      }
      // * or +
      var results: GrammarResult[] = [];
      var currentValue = value;
      var totalValue = '';
      while ((result = ref.parse(currentValue)) != null) {
        results.push(result);
        currentValue = currentValue.substr(result.value.length);
        totalValue += result.value;
        if (this.grammar.eatSpaces) {
          var spaces = currentValue.match(/^\s+/);
          if (spaces != null) {
            totalValue += spaces[0];
            currentValue = currentValue.substr(spaces[0].length);
            results.push({
              value: spaces[0],
              id: 'spaces',
              expression:null
            })
          }
        }
      }
      if (results.length == 0 && this.occurance == '+') {
        return null
      }
      return {
        expression: this,
        value: totalValue,
        id: this.id,
        subResults: results
      }
    }
  }
}
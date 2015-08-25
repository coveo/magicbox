module coveo {
  
  export class GrammarExpressionList implements GrammarExpression {    
    constructor(private parts:GrammarExpressionString[], public id: string, private grammar: Grammar) {
    }
    
    parse(value: string){
      var results: GrammarResult[] = [];
      var currentValue = value;
      var totalValue = '';
      for (var i = 0; i < this.parts.length; i++) {
        var part = this.parts[i];
        var result = part.parse(currentValue);
        if (result == null) {
          return null;
        }
        results.push(result);
        currentValue = currentValue.substr(result.value.length);
        totalValue += result.value;
        if (this.grammar.eatSpaces && i + 1 < this.parts.length) {
          var spaces = currentValue.match(/^\s+/);
          if (spaces != null) {
            totalValue += spaces[0];
            currentValue = currentValue.substr(spaces[0].length);
            results.push({
              value: spaces[0],
              id: 'spaces',
              expression: null
            })
          }
        }
      }
      return {
        value: totalValue,
        expression: this,
        subResults: results
      }
    }
  }
}
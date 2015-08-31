module coveo {
  
  export class GrammarExpressionList implements GrammarExpression {    
    constructor(private parts:GrammarExpression[], public id: string, private grammar: Grammar) {
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
      }
      return {
        value: totalValue,
        expression: this,
        subResults: results
      }
    }
  }
}
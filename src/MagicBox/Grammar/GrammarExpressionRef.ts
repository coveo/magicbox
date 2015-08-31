module coveo {
  export class GrammarExpressionRef implements GrammarExpression {
    constructor(public ref: string, public occurrence: string, public separator: string, public id: string, private grammar: Grammar) {
    }

    parse(value: string): GrammarResult {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'GrammarExpression not found:' + this.ref
      }
      var result: GrammarResult;
      if (this.occurrence == '?' || this.occurrence == null) {
        result = ref.parse(value);
        if (result == null && this.occurrence == '?') {
          return {
            value: '',
            expression: this
          }
        }
        return result
      }
      var separator = this.separator && this.grammar.getExpression(this.separator);
      if (this.separator != null && separator == null) {
        throw 'GrammarExpression not found:' + this.separator
      }
      // * or +
      var results: GrammarResult[] = [];
      var currentValue = value;
      var totalValue = '';
      while ((result = ref.parse(currentValue)) != null) {
        results.push(result);
        currentValue = currentValue.substr(result.value.length);
        totalValue += result.value;
        if (separator != null) {
          var separatorResult = separator.parse(currentValue);
          if(separatorResult == null){
            break;
          }
          results.push(separatorResult);
          currentValue = currentValue.substr(separatorResult.value.length);
          totalValue += separatorResult.value;
        }
      }
      if (results.length == 0 && this.occurrence == '+') {
        return null;
      }
      var last = _.last(results);
      if(last != null && last.expression == separator){
        return null;
      }
      return {
        expression: this,
        value: totalValue,
        subResults: results
      }
    }
  }
}
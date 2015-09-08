module coveo {
  export class GrammarExpressionRef implements GrammarExpression {
    constructor(public ref: string, public occurrence: string, public separator: string, public id: string, private grammar: Grammar) {
    }

    parse(value: string): GrammarResult<GrammarExpressionRef> {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'GrammarExpression not found:' + this.ref
      }

      var subResult: GrammarResult<GrammarExpression>;
      if (this.occurrence == '?' || this.occurrence == null) {
        subResult = ref.parse(value);
        if (!subResult.success && this.occurrence == '?') {
          return new GrammarResultRefSingleton(null, this, value);
        }
        return new GrammarResultRefSingleton(subResult, this, value);
      }

      var separator = this.separator && this.grammar.getExpression(this.separator);
      if (this.separator != null && separator == null) {
        throw 'GrammarExpression not found:' + this.separator
      }
      
      // * or +
      var subResults: GrammarResult<GrammarExpression>[] = [];
      var currentValue = value;
      do {
        subResult = ref.parse(currentValue);
        if (subResult.success) {
          subResults.push(subResult);
          currentValue = currentValue.substr(subResult.getLength());
          if (separator != null) {
            subResult = separator.parse(currentValue);
            if (subResult.success) {
              subResults.push(subResult);
              currentValue = currentValue.substr(subResult.getLength());
            }
          }
        }
      } while (subResult.success);

      if (subResults.length > 1 && _.last(subResults).expression == separator) {
        subResults.pop();
      }

      if (this.occurrence == '+' && subResults.length == 0) {
        return new GrammarResultRef([subResult], this, value);
      }

      return new GrammarResultRef(subResults, this, value);
    }
  }

  export class GrammarResultRef extends GrammarResult<GrammarExpressionRef> {
    constructor(public subResults: GrammarResult<GrammarExpression>[], public expression: GrammarExpressionRef, public input: string) {
      super(expression, input);
      if (subResults.length == 0 && this.expression.occurrence == '*') {
        this.success = true;
      } else {
        this.success = _.last(subResults).success;
      }
    }

    getSubResults() {
      return this.subResults;
    }

    getExpect() {
      return this.success ? [] : _.last(this.subResults).getExpect();
    }
  }

  export class GrammarResultRefSingleton extends GrammarResult<GrammarExpressionRef> {
    constructor(public result: GrammarResult<GrammarExpression>, public expression: GrammarExpressionRef, public input: string) {
      super(expression, input);
      if (result == null && this.expression.occurrence == '?') {
        this.success = true;
      }
      this.success = result.success;
    }

    getSubResults() {
      return [this.result];
    }

    getExpect(): GrammarResult<GrammarExpression>[] {
      if (this.result != null) {
        return this.result.getExpect();
      }
      if (this.expression.occurrence != '?') {
        return [this];
      }
      return [];
    }
  }
}
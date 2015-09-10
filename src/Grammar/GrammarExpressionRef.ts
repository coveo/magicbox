module Coveo.MagicBox {
  export class GrammarExpressionRef implements GrammarExpression {
    constructor(public ref: string, public occurrence: string, public separator: string, public id: string, public grammar: Grammar) {
    }

    parse(value: string) {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'GrammarExpression not found:' + this.ref
      }

      if (this.occurrence == '?' || this.occurrence == null) {
        return this.parseSingleton(ref, value);
      }

      var separator = this.separator && this.grammar.getExpression(this.separator);
      if (this.separator != null && separator == null) {
        throw 'GrammarExpression not found:' + this.separator
      }

      // * or +
      var subResult: GrammarResult;
      var subResults: GrammarResultSuccess[] = [];
      var currentValue = value;
      do {
        subResult = ref.parse(currentValue);
        if (subResult.success) {
          subResults.push(subResult.success);
          currentValue = currentValue.substr(subResult.success.getLength());
          if (separator != null) {
            subResult = separator.parse(currentValue);
            if (subResult.success) {
              subResults.push(subResult.success);
              currentValue = currentValue.substr(subResult.success.getLength());
            }
          }
        }
      } while (subResult.success);

      if (subResults.length > 1 && _.last(subResults).expression == separator) {
        subResults.pop();
      }

      if (this.occurrence == '+' && subResults.length == 0) {
        return new GrammarResultFail([subResult.fail], this, value);
      }

      return new GrammarResultSuccess(subResults, this, value);
    }

    parseSingleton(ref: GrammarExpression, value: string):GrammarResult {
      var result = ref.parse(value);
      var successResult = result.success;
      if (successResult) {
        return new GrammarResultSuccess([successResult], this, value);
      }
      if (this.occurrence == '?') {
        return new GrammarResultSuccess('', this, value);
      }
      return new GrammarResultFail(result.fail.getExpect(), this, value);
    }
  }
}
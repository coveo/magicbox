module Coveo.MagicBox {
  export class GrammarExpressionRef implements GrammarExpression {
    constructor(public ref: string, public occurrence: string, public separator: string, public id: string, public grammar: Grammar) {
    }

    parse(input: string, end: boolean): GrammarResult {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'GrammarExpression not found:' + this.ref
      }

      if (this.occurrence == '?' || this.occurrence == null) {
        var result = ref.parse(input, end);
        var successResult = result.success;
        if (successResult) {
          return new GrammarResultSuccess([successResult], this, input);
        }
        if (this.occurrence == '?') {
          if (!end || input.length == 0) {
            return new GrammarResultSuccess('', this, input);
          } else {
            return new GrammarResultFailEndOfInput([result], this, input);
          }
        }
        return new GrammarResultFail([result], this, input);
      }

      var separator = this.separator && this.grammar.getExpression(this.separator);
      if (this.separator != null && separator == null) {
        throw 'GrammarExpression not found:' + this.separator
      }

      // * or +
      var subResult: GrammarResult;
      var subResults: GrammarResultSuccess[] = [];
      var subInput = input;
      do {
        subResult = ref.parse(subInput, false);
        if (subResult.success) {
          subResults.push(subResult.success);
          subInput = subInput.substr(subResult.success.getLength());
          if (separator != null) {
            subResult = separator.parse(subInput, false);
            if (subResult.success) {
              subResults.push(subResult.success);
              subInput = subInput.substr(subResult.success.getLength());
            }
          }
        }
      } while (subResult.success);

      if (subResults.length > 1 && _.last(subResults).expression == separator) {
        subResults.pop();
      }

      if (this.occurrence == '+' && subResults.length == 0) {
        return new GrammarResultFail([subResult], this, input);
      }

      if (end) {
        if (subResults.length > 0) {
          var last = _.last(subResults);
          var newSubResult = last.expression.parse(last.input, true);
          if (newSubResult.fail) {
            return new GrammarResultFail(_.initial<GrammarResult>(subResults).concat([newSubResult, subResult]), this, input);
          }
          subResults[subResults.length - 1] = newSubResult.success;
          return new GrammarResultSuccess(subResults, this, input);
        } else if (input.length != 0) {
          return new GrammarResultFailEndOfInput(null, this, input);
        }
      }
      return new GrammarResultSuccess(subResults, this, input);
    }

    public toString() {
      return this.id;
    }
  }
}
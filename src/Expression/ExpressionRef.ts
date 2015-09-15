/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionRef implements Expression {
    constructor(public ref: string, public occurrence: string|number, public separator: string, public id: string, public grammar: Grammar) {
    }

    parse(input: string, end: boolean): Result {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'Expression not found:' + this.ref
      }

      if (this.occurrence == '?' || this.occurrence == null) {
        var result = ref.parse(input, end);
        var successResult = result.success;
        if (successResult) {
          return new ResultSuccess([successResult], this, input);
        }
        if (this.occurrence == '?') {
          if (!end || input.length == 0) {
            return new ResultSuccess('', this, input);
          } else {
            return new ResultFailEndOfInput([result], this, input);
          }
        }
        return new ResultFail([result], this, input);
      }

      var separator = this.separator && this.grammar.getExpression(this.separator);
      if (this.separator != null && separator == null) {
        throw 'Expression not found:' + this.separator
      }

      // * or +
      var subResult: Result;
      var subResults: ResultSuccess[] = [];
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

      if (_.isNumber(this.occurrence) && ((this.separator == null && subResults.length < this.occurrence) || (this.separator != null && (subResults.length + 1) / 2 < this.occurrence))) {
        return new ResultFail([subResult], this, input);
      }

      if (this.occurrence == '+' && subResults.length == 0) {
        return new ResultFail([subResult], this, input);
      }

      if (end) {
        if (subResults.length > 0) {
          var last = _.last(subResults);
          var newSubResult = last.expression.parse(last.input, true);
          if (newSubResult.fail) {
            return new ResultFail(_.initial<Result>(subResults).concat([newSubResult, subResult]), this, input);
          }
          subResults[subResults.length - 1] = newSubResult.success;
          return new ResultSuccess(subResults, this, input);
        } else if (input.length != 0) {
          return new ResultFailEndOfInput(null, this, input);
        }
      }
      return new ResultSuccess(subResults, this, input);
    }

    public toString() {
      return this.id;
    }
  }
}
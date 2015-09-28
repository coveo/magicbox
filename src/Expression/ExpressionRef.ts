/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionRef implements Expression {
    constructor(public ref: string, public occurrence: string|number, public id: string, public grammar: Grammar) {
    }

    parse(input: string, end: boolean): Result {
      var ref = this.grammar.getExpression(this.ref);
      if (ref == null) {
        throw 'Expression not found:' + this.ref
      }
      if (this.occurrence == '?' || this.occurrence == null) {
        return this.parseOnce(input, end, ref);
      } else {
        return this.parseMany(input, end, ref);
      };
    }

    parseOnce(input: string, end: boolean, ref: Expression): Result {
      var refResult = ref.parse(input, end);
      if (!refResult.isSuccess() && this.occurrence == '?') {
        if (end) {
          // if end was found
          if (input.length == 0) {
            return new Result('', this, input);
          }
          // if end was not found and all error expression are EndOfInput, reparse with end = false.
          if (_.all(refResult.getBestExpect(), (expect) => expect.expression == ExpressionEndOfInput)) {
            return new EndOfInputResult(ref.parse(input, false));
          }
          return refResult;
        }
        return new Result('', this, input);
      }
      return new Result([refResult], this, input);
    }

    parseMany(input: string, end: boolean, ref: Expression) {
      var subResults: Result[] = [];
      var subResult: Result;
      var subInput = input;
      var success: boolean;

      // try to parse until it do not match
      do {
        subResult = ref.parse(subInput, false);
        success = subResult.isSuccess();
        if (success) {
          subResults.push(subResult);
          subInput = subInput.substr(subResult.getLength());
        }
      } while (success);
      
      // minimal occurance of a ref
      var requiredOccurance = _.isNumber(this.occurrence) ? <number>this.occurrence : (this.occurrence == '+' ? 1 : 0);

      // if the minimal occurance is not reached add the fail result to the list
      if (subResults.length < requiredOccurance) {
        subResults.push(subResult);
      } else if (end) {
        // if there is at least one match, check if the last match is at the end 
        if (subResults.length > 0) {
          var last = subResults.pop();
          var newSubResult = last.expression.parse(last.input, true);
          subResults.push(newSubResult);
        } else if (input.length != 0) {
          return new EndOfInputResult(new Result(subResults, this, input));
        }
      }
      return new Result(subResults, this, input);
    }

    public toString() {
      return this.id;
    }
  }
}
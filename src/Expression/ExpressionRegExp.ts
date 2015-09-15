/// <reference path="../Grammar.ts" />
module Coveo.MagicBox {
  export class ExpressionRegExp implements Expression {
    constructor(public value: RegExp, public id: string, grammar: Grammar) {
    }

    parse(input: string, end:boolean):Result {
      var groups = input.match(this.value);
      if (groups != null && groups.index != 0) {
        groups = null;
      }
      if(groups == null){
        return new ResultFail(null, this, input);
      }
      if(end && input.length > groups[0].length){
        return new ResultFailEndOfInput(null, this, input.substr(groups[0].length));
      }
      return new ResultSuccess(groups[0], this, input);
    }

    public toString(){
      return this.id;
    }
  }
}
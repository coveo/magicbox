module Coveo.MagicBox {
  export class GrammarExpressionRegExp implements GrammarExpression {
    constructor(public value: RegExp, public id: string, grammar: Grammar) {
    }

    parse(input: string, end:boolean):GrammarResult {
      var groups = input.match(this.value);
      if (groups != null && groups.index != 0) {
        groups = null;
      }
      if(groups == null){
        return new GrammarResultFail(null, this, input);
      }
      if(end && input.length > groups[0].length){
        return new GrammarResultFailEndOfInput(null, this, input.substr(groups[0].length));
      }
      return new GrammarResultSuccess(groups[0], this, input);
    }

    public toString(){
      return this.id;
    }
  }
}
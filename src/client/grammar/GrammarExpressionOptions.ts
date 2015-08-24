/// <reference path="Grammar.ts" />
module coveo {
  export class GrammarExpressionOptions implements GrammarExpression {    
    constructor(private parts:GrammarExpressionRef[], public id: string, private grammar: Grammar) {
    }
    
    parse(value: string){
      console.log(this);
      return _.reduce(this.parts, (result: GrammarResult, subExpression: GrammarExpression) => result || subExpression.parse(value), null);
    }
    
    static stringToParts(value:string, grammar: Grammar){
      return _.map(value.split('|'), (v)=>new GrammarExpressionRef(v, null, null, grammar));
    }
    
  }
}
/// <reference path="Grammar.ts" />
module coveo {
  export class GrammarExpressionOptions implements GrammarExpression {    
    constructor(private parts:GrammarExpressionRef[], public id: string, private grammar: Grammar) {
    }
    
    parse(value: string):GrammarResult{
      var subresult = _.reduce(this.parts, (result: GrammarResult, subExpression: GrammarExpression) => result || subExpression.parse(value), null);
      if(subresult != null){
        return {
          value: subresult.value,
          expression:this,
          subResults: [subresult]
        }
      }
      return null;
    }
    
    static stringToParts(value:string, grammar: Grammar){
      return _.map(value.split('|'), (v)=>new GrammarExpressionRef(v, null, null, grammar));
    }
    
  }
}
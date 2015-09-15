/// <reference path="../Grammar.ts" />

module Coveo.MagicBox {
  export type ExpressionDef = ExpressionDefSimple|ExpressionDefSimple[];
  export type ExpressionDefSimple = RegExp|string;
  
  export interface Expression {
    id: string;
    parse:(input: string, end: boolean)=>Result;
  }
}
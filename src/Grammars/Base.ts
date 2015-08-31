/// <reference path="../MagicBox/MagicBox.ts" />
module coveo.grammars {
  export function Base(){
    return new Grammar('[any]', {
      any: /./
    });
  }
}
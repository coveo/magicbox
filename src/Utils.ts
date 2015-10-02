module Coveo.MagicBox.Utils {
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  var highligthDefaultTemplate = _.template('<span<%= highligth ? \' class="magic-box-hightlight"\' : \'\' %>><%- text %></span>')

  export function highligthText(text: string, highligth: string, ignoreCase = false, template = highligthDefaultTemplate) {
    if (highligth.length == 0) {
      return text;
    }
    var escaped = escapeRegExp(highligth);
    var stringRegex = '('+escaped+')|(.*?(?='+escaped+')|.+)'
    var regex = new RegExp(stringRegex, ignoreCase ? 'gi' : 'g');
    return text.replace(regex, (text, match, notmatch)=>highligthDefaultTemplate({text:text, highligth:match != null}));
  }
}

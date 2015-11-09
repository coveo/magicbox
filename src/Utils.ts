module Coveo.MagicBox.Utils {
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  var escapeText = (classname: string, text: string) => {
    return `<span class="${classname}">${_.escape(text) }</span>`
  }

  export function highligthText(text: string, highligth: string, ignoreCase = false, matchClass: string = 'magic-box-hightlight', doNotMatchClass: string = '') {
    if (highligth.length == 0) {
      return text;
    }
    var escaped = escapeRegExp(highligth);
    var stringRegex = '(' + escaped + ')|(.*?(?=' + escaped + ')|.+)'
    var regex = new RegExp(stringRegex, ignoreCase ? 'gi' : 'g');
    return text.replace(regex, (text, match, notmatch) => escapeText(match != null ? matchClass : doNotMatchClass, text));
  }
}

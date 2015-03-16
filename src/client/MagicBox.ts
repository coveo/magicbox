interface MagicMatcher {
  regex:RegExp;
  class:string;
  index?:number;
  condition?:(text: string, tokens: MagicToken[])=>boolean;
}

interface MagicToken {
  start:number;
  length:number;
  class:string;
  subTokens?:MagicToken[];
}

class MagicBox {
  private input: JQuery;
  private underlay: JQuery;
  private text: string;
  private tokens: MagicToken[];
  private hasFocus: boolean = false;
  private hasMouseOver: boolean = false;
  public matchers: MagicMatcher[] = [];

  constructor(public element: JQuery) {
    element.addClass('magic-box');
    this.underlay = $('<div class="magic-box-underlay" />').appendTo(element);
    this.input = $('<input type="text" />').appendTo(element);
    this.setupHandler();
  }

  public getText() {
    return this.text;
  }

  public getTokens() {
    return this.tokens;
  }

  public addMatcher(matcher: MagicMatcher) {
    if (matcher.index != null) {
      for (var i = 0; i < this.matchers.length; i++) {
        if (this.matchers[i].index == null || this.matchers[i].index < matcher.index) {
          this.matchers.splice(i, 0, matcher);
          break;
        }
      }
      if (i == this.matchers.length) {
        this.matchers.push(matcher);
      }
    } else {
      this.matchers.push(matcher);
    }
  }

  public ghostText(): string {
    return null;
  }

  public updateGhostText() {
    var ghostText = this.ghostText();
    this.underlay.find('.magic-box-ghost-text').detach();
    if (ghostText != null) {
      $('<span class="magic-box-ghost-text" />')
          .text(ghostText)
          .appendTo(this.underlay);
    }
  }

  public tabPress(preventDefault: Function) {
  }

  public upPress(preventDefault: Function) {
  }

  public downPress(preventDefault: Function) {
  }

  public anyPress(preventDefault: Function) {
  }

  public setText(text: string) {
    this.input.val(text);
    this.tokenize();
  }

  public setCursor(index: number) {
    var input = <HTMLInputElement>this.input.get(0);
    if (input.createTextRange) {
      var range = input.createTextRange();
      range.move("character", index);
      range.select();
    } else if (input.selectionStart != null) {
      input.focus();
      input.setSelectionRange(index, index);
    }
  }

  private setupHandler() {
    this.input
        .blur(()=>this.blur())
      //.change(()=>this.change())
      //.click(()=>this.click())
        .focus(()=>this.focus())
        .keydown((e)=>this.keydown(e))
        .keyup((e)=>this.keyup(e))
        .mouseenter(()=>this.mouseenter())
        .mouseleave(()=>this.mouseleave())
      //.past(()=>this.past())
      //.past(()=>this.past())
        .scroll(()=>
            this.updateScroll(false)
    )
  }

  private blur() {
    this.hasFocus = false;
  }

  private change() {

  }

  private click() {

  }

  private focus() {
    this.hasFocus = true;
    this.updateScroll();
  }

  private keydown(e: JQueryKeyEventObject) {
    switch (e.keyCode || e.which) {
      // TAB, Up, Down
      case 9:
      case 38:
      case 40:
        e.preventDefault();
        break;
      default:
        // wait the key to be enter
        setTimeout(()=> {
          this.tokenize();
        });
        break;
    }
  }

  private keyup(e: JQueryKeyEventObject) {
    switch (e.keyCode || e.which) {
      // TAB
      case 9:
        this.tabPress(e.preventDefault);
        break;
      // Up
      case 38:
        this.upPress(e.preventDefault);
        break;
      // Down
      case 40:
        this.downPress(e.preventDefault);
        break;
      default:
        this.tokenize();
        this.anyPress(e.preventDefault);
        break;
    }
  }

  private mouseenter() {
    this.hasMouseOver = true;
    this.updateScroll();
  }

  private mouseleave() {
    this.hasMouseOver = false;
  }

  private highlightDefer: number;

  private highligth() {
    if (this.highlightDefer == null) {
      this.highlightDefer = MagicBox.defer(()=> {
        this.highlightTokens(this.text, this.tokens, this.underlay);
        this.updateGhostText();
        this.updateScroll(false);
        this.highlightDefer = null;
      })
    }
  }

  private highlightTokens(text: string, tokens: MagicToken[], container: JQuery) {
    var index = 0;
    container.empty();
    _.forEach(tokens, (token)=> {
      if (token != null) {
        if (index < token.start) {
          $('<span />')
              .text(text.substr(index, token.start - index))
              .appendTo(container);
        }
        index = token.start;
        var tokenText = text.substr(index, token.length);
        var tokenDom = $('<span class="magic-box-token" />')
            .addClass(token.class)
            .appendTo(container);
        if (token.subTokens == null || token.subTokens.length == 0) {
          tokenDom.text(tokenText)
        } else {
          this.highlightTokens(tokenText, token.subTokens, tokenDom);
        }
        index += token.length;
      }
    });
    if (index < text.length) {
      $('<span />')
          .text(text.substr(index, text.length - index))
          .appendTo(container);
    }
  }

  private updateScrollDefer: number;

  private updateScroll(defer = true) {
    if (this.updateScrollDefer == null) {
      var callback = ()=> {
        this.underlay.scrollLeft(this.input.scrollLeft());
        this.updateScrollDefer = null;
        if (this.hasFocus) {
          this.updateScroll();
        }
      }
      if (!defer) {
        callback();
      } else {
        this.updateScrollDefer = MagicBox.defer(callback)
      }
    }
  }

  private tokenize() {
    var text = this.input.val();
    if (this.text != text) {
      this.text = text;
      this.tokens = [];
      var token: MagicToken;
      var i = 0;
      while ((token = this.matcher()) != null) {
        if (token.length == 0) {
          throw 'Token should not accept empty content. ' + JSON.stringify(token);
        }
        this.tokens.push(token);
      }
      this.highligth();
    }
  }


  matcher(): MagicToken {
    var last = _.last(this.tokens);
    var index = last == null ? 0 : last.start + last.length;
    var remain = this.text.substr(index);
    var matcher = _.find(this.matchers, (matcher)=>matcher.regex.test(remain) && (matcher.condition == null || matcher.condition(this.text, this.tokens)));

    if (matcher != null) {
      var match = remain.match(matcher.regex);
      var start = remain.indexOf(match[0]);
      var subTokenIndex = start;
      var subTokens: MagicToken[] = [];
      for (var i = 1; i < match.length; i++) {
        if (match[i] == null) {
          subTokens.push(null);
        } else {
          var subTokenStart = remain.substr(subTokenIndex).indexOf(match[i]) + subTokenIndex;
          subTokens.push({
            start: subTokenStart,
            length: match[i].length,
            class: 'group-' + i
          });
          subTokenIndex = subTokenStart + match[i].length;
        }
      }
      return {
        class: matcher.class,
        start: start + index,
        length: match[0].length,
        subTokens: subTokens
      }
    }
    return null;
  }

  static defer(callback: ()=>void) {
    if ('requestAnimationFrame' in window) {
      return requestAnimationFrame(callback);
    }
    return setTimeout(callback);
  }
}
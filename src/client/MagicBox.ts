/// <reference path="jquery.d.ts" />
/// <reference path="grammar/Grammar.ts" />
module coveo {
  export interface MagicSuggestion {
    text: string;
    index?: number;
    html?: string;
    onSelect?: () => void;
  }

  export interface MagicSuggestionsCreator {
    (magicBox: MagicBox): JQueryPromise<MagicSuggestion[]>|MagicSuggestion[];
  }

  export class MagicBox {
    private input: JQuery;
    private underlay: JQuery;
    private suggestions: JQuery;
    private text: string;
    private hasFocus: boolean = false;
    private hasMouseOver: boolean = false;
    private grammarResult: GrammarResult;

    private suggestionsCreators: MagicSuggestionsCreator[] = []

    constructor(public element: JQuery, public grammar: Grammar) {
      element.addClass('magic-box');
      this.underlay = $('<div class="magic-box-underlay" />').appendTo(element);
      this.input = $('<input type="text" />').appendTo(element);
      this.suggestions = $('<div class="magic-box-suggestions" />').appendTo(element);
      this.setupHandler();
    }

    public getText() {
      return this.text;
    }

    public getGrammarResult() {
      return this.grammarResult;
    }

    public getSuggestions(): JQueryPromise<MagicSuggestion[]> {
      var nbPending = this.suggestionsCreators.length;
      var results: MagicSuggestion[] = [];
      var deferred = $.Deferred<MagicSuggestion[]>();
      _.each(this.suggestionsCreators, (suggestionsCreator) => {
        $.when(suggestionsCreator(this))
          .done((items: MagicSuggestion[]) => {
            results = results.concat(items);
          })
          .always(() => {
            nbPending--;
            if (nbPending == 0) {
              deferred.resolve(results);
            }
          });
      });
      if (this.suggestionsCreators.length == 0) {
        deferred.resolve([]);
      }
      return deferred;
    }

    public addAutocomplete(creator: MagicSuggestionsCreator) {
      this.suggestionsCreators.push(creator);
    }

    public updateAutocomplete() {
      this.underlay.find('.magic-box-ghost-text').detach();
      this.suggestions.empty();

      var ghostText = $.Deferred<string>();
      var suggestions = this.getSuggestions();

      suggestions.done((suggestions) => {
        var first = _.first(suggestions);
        if (first != null && first.text.indexOf(this.text) == 0) {
          ghostText.resolve(first.text.substr(this.text.length));
        } else {
          ghostText.resolve('');
        }

        this.suggestions.append(_.map(suggestions, (suggestion: MagicSuggestion) => {
          var suggestionDom = $('<div />').addClass('magic-box-suggestion');
          if (suggestion.html != null) {
            suggestionDom.html(suggestion.html);
          } else {
            suggestionDom.html(this.highligthSuggestion(suggestion.text))
          }
          var onSelect = suggestion.onSelect != null ? suggestion.onSelect : ()=>{
            this.setText(suggestion.text);
          }
          suggestionDom.click(onSelect);
          return suggestionDom;
        }));
      });

      ghostText.done((ghostText) => {
        if (ghostText != null) {
          $('<span class="magic-box-ghost-text" />')
            .text(ghostText)
            .appendTo(this.underlay);
        }
      })
    }

    public highligthSuggestion(text: string) {
      return text;
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
      this.onChange();
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
        .blur(() => this.blur())
      //.change(()=>this.change())
      //.click(()=>this.click())
        .focus(() => this.focus())
        .keydown((e) => this.keydown(e))
        .keyup((e) => this.keyup(e))
        .mouseenter(() => this.mouseenter())
        .mouseleave(() => this.mouseleave())
      //.past(()=>this.past())
      //.past(()=>this.past())
        .scroll(() => this.updateScroll(false))
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
          setTimeout(() => {
            this.onChange();
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
          this.onChange();
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
      this.highlightDefer = this.highlightDefer || MagicBox.defer(() => {
        this.underlay.empty().append(Grammar.resultToElement(this.grammarResult, this.text));
        this.updateAutocomplete();
        this.updateScroll(false);
        this.highlightDefer = null;
      })
    }

    private updateScrollDefer: number;
    private updateScroll(defer = true) {
      var callback = () => {
        this.underlay.scrollLeft(this.input.scrollLeft());
        this.updateScrollDefer = null;
        if (this.hasFocus) {
          this.updateScroll();
        }
      }
      if (!defer) {
        callback();
      } else if (this.updateScrollDefer == null) {
        this.updateScrollDefer = MagicBox.defer(callback)
      }
    }

    private onChange() {
      var text = this.input.val();
      if (this.text != text) {
        this.text = text;
        this.grammarResult = this.grammar.parse(text);
        this.highligth();
      }
    }

    static defer(callback: () => void) {
      if ('requestAnimationFrame' in window) {
        return requestAnimationFrame(callback);
      }
      return setTimeout(callback);
    }
  }
}
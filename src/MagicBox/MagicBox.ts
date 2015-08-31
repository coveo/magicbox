/// <reference path="../jquery.d.ts" />
/// <reference path="Grammar/Grammar.ts" />
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
    private input: HTMLInputElement;
    private underlay: HTMLElement;
    private highlightContainer: HTMLElement;
    private ghostTextContainer: HTMLElement;
    private suggestions: HTMLElement;
    private text: string;
    private hasFocus: boolean = false;
    private hasMouseOver: boolean = false;
    private grammarResult: GrammarResult;

    private suggestionsCreators: MagicSuggestionsCreator[] = [];
    private pendingSuggestion: JQueryDeferred<MagicSuggestion[]>;

    constructor(public element: HTMLElement, public grammar: Grammar) {
      $(element).addClass('magic-box');

      this.underlay = document.createElement('div');
      this.underlay.className = "magic-box-underlay";
      this.element.appendChild(this.underlay);

      this.highlightContainer = document.createElement('span');
      this.highlightContainer.className = "magic-box-highlight-container";
      this.underlay.appendChild(this.highlightContainer);

      this.ghostTextContainer = document.createElement('span');
      this.ghostTextContainer.className = "magic-box-ghost-text";
      this.underlay.appendChild(this.ghostTextContainer);

      this.input = <HTMLInputElement>document.createElement('input');
      this.element.appendChild(this.input);

      this.suggestions = document.createElement('div');
      this.suggestions.className = "magic-box-suggestions";
      this.element.appendChild(this.suggestions);

      this.setupHandler();
    }

    public getText() {
      return this.text;
    }

    public getGrammarResult() {
      return this.grammarResult;
    }

    public getSuggestions(): JQueryPromise<MagicSuggestion[]> {
      if (this.pendingSuggestion != null) {
        this.pendingSuggestion.reject('');
      }
      var nbPending = this.suggestionsCreators.length;
      var results: MagicSuggestion[] = [];
      var deferred = this.pendingSuggestion = $.Deferred<MagicSuggestion[]>();
      _.each(this.suggestionsCreators, (suggestionsCreator) => {
        $.when(suggestionsCreator(this))
          .done((items: MagicSuggestion[]) => {
            if (items != null) {
              results = results.concat(items);
            }
          })
          .always(() => {
            nbPending--;
            if (nbPending == 0) {
              if (deferred == this.pendingSuggestion) {
                deferred.resolve(results);
              } else {
                deferred.reject();
              }
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
      this.ghostTextContainer.innerHTML = '';
      this.suggestions.innerHTML = '';

      var ghostText = $.Deferred<string>();
      var suggestions = this.getSuggestions();

      suggestions.done((suggestions) => {
        var first = _.first(suggestions);
        if (first != null && first.text.indexOf(this.text) == 0) {
          ghostText.resolve(first.text.substr(this.text.length));
        } else {
          ghostText.resolve('');
        }

        _.each(suggestions, (suggestion: MagicSuggestion) => {
          var suggestionDom = document.createElement('div');
          suggestionDom.className = 'magic-box-suggestion';
          suggestionDom.innerHTML = suggestion.html != null ? suggestion.html : this.highligthSuggestion(suggestion.text);
          var onSelect = suggestion.onSelect != null ? suggestion.onSelect : () => {
            this.setText(suggestion.text);
            this.setCursor(suggestion.text.length);
          }
          suggestionDom.onclick = onSelect;
          suggestionDom['suggestion'] = suggestion;
          this.suggestions.appendChild(suggestionDom);
        });
      });

      ghostText.done((ghostText) => {
        if (ghostText != null && this.getCursor() == this.text.length) {
          this.ghostTextContainer.appendChild(document.createTextNode(ghostText))
        }
      })
    }

    public highligthSuggestion(text: string) {
      return text;
    }

    public tabPress() {
      this.setText(this.text + this.ghostTextContainer.innerText);
    }

    public upPress() {
      var selected = this.suggestions.querySelector('.magic-box-selected');
      if (selected != null) {
        $(selected).removeClass('magic-box-selected');
        $(selected.previousElementSibling).addClass('magic-box-selected')
      } else {
        $(this.suggestions).children().last().addClass('magic-box-selected');
      }
    }

    public downPress() {
      var selected = this.suggestions.querySelector('.magic-box-selected');
      if (selected != null) {
        $(selected).removeClass('magic-box-selected');
        $(selected.nextElementSibling).addClass('magic-box-selected')
      } else {
        $(this.suggestions).children().first().addClass('magic-box-selected');
      }
    }

    public enterPress() {
      var selected = <HTMLElement>this.suggestions.querySelector('.magic-box-selected');
      if (selected != null) {
        selected.onclick(null);
      }
    }

    public anyPress(preventDefault: Function) {
    }

    public setText(text: string) {
      $(this.input).val(text);
      this.onChange();
    }

    public setTextFromResult(result: GrammarResult = this.grammarResult) {
      this.setText(Grammar.resultToString(result));
    }

    public setCursor(index: number) {
      if (this.input.createTextRange) {
        var range = this.input.createTextRange();
        range.move("character", index);
        range.select();
      } else if (this.input.selectionStart != null) {
        this.input.focus();
        this.input.setSelectionRange(index, index);
      }
    }

    public getCursor() {
      return this.input.selectionStart
    }

    public resultAtCursor(index = this.getCursor(), result = this.grammarResult): GrammarResult[] {
      if (result == null || index < 0 || index > result.value.length) {
        return null;
      }
      if (result.subResults != null) {
        var subResult: GrammarResult[];
        for (var i = 0; i < result.subResults.length && subResult == null; i++) {
          subResult = this.resultAtCursor(index, result.subResults[i]);
          index -= result.subResults[i].value.length;
        }
        if (subResult != null) {
          subResult.push(result);
          return subResult;
        }
        debugger;
      }
      return [result]
    }

    private setupHandler() {
      $(this.input)
        .blur(() => this.blur())
        .focus(() => this.focus())
        .keydown((e) => this.keydown(e))
        .keyup((e) => this.keyup(e))
        .mouseenter(() => this.mouseenter())
        .mouseleave(() => this.mouseleave())
        .scroll(() =>
          this.updateScroll(false)
          )
    }

    private blur() {
      this.hasFocus = false;
      setTimeout(() => {
        if (!this.hasFocus) {
          this.suggestions.innerHTML = '';
        }
      }, 300);
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
          MagicBox.defer(() => {
            this.onChange();
          });
          break;
      }
    }

    private keyup(e: JQueryKeyEventObject) {
      switch (e.keyCode || e.which) {
        // TAB
        case 9:
          this.tabPress();
          break;
        // Up
        case 38:
          this.upPress();
          break;
        // Down
        case 40:
          this.downPress();
          break;
        case 13:
          this.enterPress();
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
        this.highlightContainer.innerHTML = '';
        this.highlightContainer.appendChild(Grammar.resultToElement(this.grammarResult, this.text));
        this.updateAutocomplete();
        this.updateScroll(false);
        this.highlightDefer = null;
      })
    }

    private updateScrollDefer: number;
    private updateScroll(defer = true) {
      var callback = () => {
        this.underlay.style.visibility = 'hidden';
        this.underlay.scrollLeft = this.input.scrollLeft;
        this.underlay.scrollTop = this.input.scrollTop;
        this.underlay.style.visibility = 'visible';
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
      var text = this.input.value;
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
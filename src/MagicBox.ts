/// <reference path="../bin/jquery.d.ts" />
/// <reference path="../bin/underscore.d.ts" />
/// <reference path="Grammar/Grammar.ts" />
/// <reference path="Grammars/CoveoField.ts" />
module Coveo.MagicBox {
  export interface Suggestion {
    text: string;
    index?: number;
    html?: string;
    onSelect?: () => void;
  }

  export interface SuggestionsCreator {
    (magicBox: Instance): JQueryPromise<Suggestion[]>|Suggestion[];
  }

  export class Instance {
    private input: HTMLInputElement;
    private underlay: HTMLElement;
    private highlightContainer: HTMLElement;
    private ghostTextContainer: HTMLElement;
    private suggestions: HTMLElement;
    private text: string;
    private hasFocus: boolean = false;
    private hasMouseOver: boolean = false;
    private grammarResult: GrammarResult;

    private suggestionsCreators: SuggestionsCreator[] = [];
    private pendingSuggestion: JQueryDeferred<Suggestion[]>;

    constructor(public element: HTMLElement, public grammar: Grammar) {
      $(element).addClass('magic-box');

      var inputContainer = document.createElement('div');
      inputContainer.className = "magic-box-input";
      element.appendChild(inputContainer);

      this.underlay = document.createElement('div');
      this.underlay.className = "magic-box-underlay";
      inputContainer.appendChild(this.underlay);

      this.highlightContainer = document.createElement('span');
      this.highlightContainer.className = "magic-box-highlight-container";
      this.underlay.appendChild(this.highlightContainer);

      this.ghostTextContainer = document.createElement('span');
      this.ghostTextContainer.className = "magic-box-ghost-text";
      this.underlay.appendChild(this.ghostTextContainer);

      this.input = <HTMLInputElement>document.createElement('input');
      inputContainer.appendChild(this.input);

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

    public getSuggestions(): JQueryPromise<Suggestion[]> {
      if (this.pendingSuggestion != null) {
        this.pendingSuggestion.reject('');
      }
      var nbPending = this.suggestionsCreators.length;
      var results: Suggestion[] = [];
      var deferred = this.pendingSuggestion = $.Deferred<Suggestion[]>();
      _.each(this.suggestionsCreators, (suggestionsCreator) => {
        $.when(suggestionsCreator(this))
            .done((items: Suggestion[]) => {
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

    public addAutocomplete(creator: SuggestionsCreator) {
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

        _.each(suggestions, (suggestion: Suggestion) => {
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

    public resultAtCursor(index = this.getCursor(), result = this.grammarResult): GrammarResultSuccess[] {
      if (result.success) {
        if (index < 0) {
          return null;
        }
        var length = result.success.getLength();
        if (index > length) {
          return null;
        }
        var subResults = result.success.getSubResults();
        if (subResults != null) {
          var subIndex = Number(index);
          for (var i = 0; i < subResults.length; i++) {
            var resultAtCursor = this.resultAtCursor(subIndex, subResults[i]);
            if (resultAtCursor != null) {
              resultAtCursor.push(result.success);
              return resultAtCursor;
            }
            subIndex -= subResults[i].getLength();
          }
          throw 'Well... this should not happen';
        }
        return [result.success];
      }
      return null;
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
          requestAnimationFrame(() => {
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
      this.highlightDefer = this.highlightDefer || requestAnimationFrame(() => {
            this.highlightContainer.innerHTML = '';
            if (this.grammarResult.success) {
              this.highlightContainer.appendChild(this.grammarResult.success.toHtmlElement());
            }
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
        this.updateScrollDefer = requestAnimationFrame(callback)
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
  }

  export function create(element: HTMLElement, grammar: Grammar) {
    return new Instance(element, grammar);
  }

  export function requestAnimationFrame(callback: () => void) {
    if ('requestAnimationFrame' in window) {
      return window.requestAnimationFrame(callback);
    }
    return setTimeout(callback);
  }
}
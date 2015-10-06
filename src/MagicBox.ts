/// <reference path="../bin/jquery.d.ts" />
/// <reference path="../bin/underscore.d.ts" />
/// <reference path="Grammar.ts" />
/// <reference path="Utils.ts"/>
/// <reference path="Grammars/Grammars.ts" />
module Coveo.MagicBox {

  export var SuggestionsEvent = 'MagicBocSuggestions';

  export interface Suggestion {
    text?: string;
    index?: number;
    html?: string;
    dom?: HTMLElement;
    seperator?: string;
    onSelect?: () => void;
  }

  export interface SuggestionCreator {
    (magicbox: Instance): JQueryPromise<Suggestion[]>|Suggestion[];
  }

  export class Instance {
    public input: HTMLInputElement;
    public onEnterPress: () => void;
    public onClear: () => void;
    public onBlur: () => void;

    public getSuggestions: (magicBox: Instance) => Array<JQueryPromise<Suggestion[]>|Suggestion[]>;
    public onUpdateSuggestions: (suggestions: Suggestion[], ghostText: string) => void;
    public suggestionSelect: (suggestion: Suggestion) => void;

    private clear: HTMLElement;
    private underlay: HTMLElement;
    private highlightContainer: HTMLElement;
    private ghostTextContainer: HTMLElement;
    private suggestionsContainer: HTMLElement;

    private text: string = '';
    private ghostText: string = '';
    private hasFocus: boolean = false;
    private hasMouseOver: boolean = false;
    private lastSuggestions: Suggestion[];

    private result: Result;
    private displayedResult: Result;

    private pendingSuggestion: JQueryDeferred<Suggestion[]>;

    constructor(public element: HTMLElement, public grammar: Grammar, private inline = false) {
      $(element)
        .addClass('magic-box')
        .toggleClass('magic-box-inline', inline);

      this.clear = document.createElement('div');
      this.clear.className = "magic-box-clear";
      this.element.appendChild(this.clear);

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

      this.input = document.createElement('input');
      this.input.spellcheck = false;
      inputContainer.appendChild(this.input);

      this.suggestionsContainer = document.createElement('div');
      this.suggestionsContainer.className = "magic-box-suggestions";
      this.element.appendChild(this.suggestionsContainer);


      this.setupHandler();

      this.updateResult();
      this.highligth();
    }

    public getText() {
      return this.text;
    }

    public getGhostText() {
      return this.ghostText;
    }

    public getResult() {
      return this.result;
    }

    public getDisplayedResult() {
      return this.displayedResult;
    }

    private getSuggestionsPromise(): JQueryPromise<Suggestion[]> {
      if (this.pendingSuggestion != null) {
        this.pendingSuggestion.reject('');
      }

      var suggestions: Array<JQueryPromise<Suggestion[]>|Suggestion[]> = this.getSuggestions != null ? this.getSuggestions(this) : [];

      var nbPending = suggestions.length;
      var results: Suggestion[] = [];
      var deferred = this.pendingSuggestion = $.Deferred<Suggestion[]>();
      _.each(suggestions, (suggestions: JQueryDeferred<Suggestion[]>|Suggestion[]) => {
        $.when<Suggestion[]>(suggestions)
          .done((items) => {
          if (items != null) {
            results = results.concat(items);
          }
        })
          .always(() => {
          nbPending--;
          if (nbPending == 0) {
            if (deferred == this.pendingSuggestion) {
              deferred.resolve(_.sortBy(results, 'index'));
            } else {
              deferred.reject();
            }
          }
        });
      });
      if (suggestions.length == 0) {
        deferred.resolve([]);
      }
      return deferred;
    }

    private lastSuccestion: { text: string; cursor: number };
    private updateSuggestionsDefer: number;
    public updateSuggestions() {
      if (this.getSuggestions != null && (this.lastSuccestion == null || this.lastSuccestion.text != this.getText() || this.lastSuccestion.cursor != this.getCursor())) {
        this.lastSuccestion = {
          text: this.getText(),
          cursor: this.getCursor()
        }
        this.ghostTextContainer.innerHTML = '';
        var suggestions = this.getSuggestionsPromise();
        this.suggestionsContainer.className = "magic-box-suggestions magic-box-suggestions-loading";
        this.lastSuggestions = null;
        suggestions.done((suggestions) => {
          this.lastSuggestions = suggestions;
          this.suggestionsContainer.innerHTML = '';
          this.suggestionsContainer.className = "magic-box-suggestions";
          var first = _.find(suggestions, (suggestion) => suggestion.text != null);
          var ghostText = first != null && first.text.toLowerCase().indexOf(this.text.toLowerCase()) == 0 ? first.text.substr(this.text.length) : '';

          if (ghostText != null && this.getCursor() == this.text.length) {
            this.ghostTextContainer.appendChild(document.createTextNode(ghostText))
          }

          this.ghostText = ghostText || '';

          _.each(suggestions, (suggestion: Suggestion) => {
            var dom = suggestion.dom;
            if (!dom) {
              dom = document.createElement('div');
              dom.className = 'magic-box-suggestion';
              if (suggestion.html != null) {
                dom.innerHTML = suggestion.html;
              } else if (suggestion.text != null) {
                dom.appendChild(document.createTextNode(suggestion.text));
              } else if (suggestion.seperator != null) {
                dom.className = 'magic-box-suggestion-seperator';
                var suggestionLabel = document.createElement('div');
                suggestionLabel.className = 'magic-box-suggestion-seperator-label';
                suggestionLabel.appendChild(document.createTextNode(suggestion.seperator))
                dom.appendChild(suggestionLabel)
              }
            }
            var onSelect: () => void = suggestion.onSelect;
            if (onSelect == null && suggestion.text != null) {
              onSelect = () => {
                this.setText(suggestion.text);
                this.setCursor(suggestion.text.length);
              }
            }
            if (onSelect != null) {
              dom.onclick = onSelect;
            }
            dom['suggestion'] = suggestion;
            $(dom).removeClass('magic-box-selected');
            this.suggestionsContainer.appendChild(dom);
          });
          if (this.onUpdateSuggestions) {
            this.onUpdateSuggestions(suggestions, ghostText);
          }
          $(this.element).toggleClass('magic-box-hasSuggestion', suggestions.length > 0);
        });
      }
      if (this.onUpdateSuggestions) {
        this.onUpdateSuggestions(this.lastSuggestions, this.ghostText);
      }
    }

    private tabPress() {
      this.setText(this.text + this.ghostTextContainer.innerText);
    }

    private upPress() {
      var selected = this.suggestionsContainer.querySelector('.magic-box-selected');
      if (selected != null) {
        $(selected).removeClass('magic-box-selected');
        selected = selected.previousElementSibling;
      } else {
        selected = _.last($(this.suggestionsContainer).children());
      }
      while (selected != null && (<HTMLElement>selected).onclick == null) {
        selected = selected.previousElementSibling
      }
      var selectedSuggestion:Suggestion = selected && selected['suggestion'];
      if (this.suggestionSelect != null) {
        this.suggestionSelect(selectedSuggestion);
      }
      if (selectedSuggestion && selectedSuggestion.text){
        this.highligth(this.grammar.parse(selectedSuggestion.text).clean());
      } else {
        this.highligth();
      }
      $(selected).addClass('magic-box-selected');
    }

    private downPress() {
      var selected = this.suggestionsContainer.querySelector('.magic-box-selected');
      if (selected != null) {
        $(selected).removeClass('magic-box-selected');
        selected = selected.nextElementSibling;
      } else {
        selected = _.first($(this.suggestionsContainer).children());
      }
      while (selected != null && (<HTMLElement>selected).onclick == null) {
        selected = selected.nextElementSibling
      }
      var selectedSuggestion:Suggestion = selected && selected['suggestion'];
      if (this.suggestionSelect != null) {
        this.suggestionSelect(selectedSuggestion);
      }
      if (selectedSuggestion && selectedSuggestion.text){
        this.highligth(this.grammar.parse(selectedSuggestion.text).clean());
      } else {
        this.highligth();
      }
      $(selected).addClass('magic-box-selected');
    }

    private enterPress(e: JQueryKeyEventObject) {
      var selected = <HTMLElement>this.suggestionsContainer.querySelector('.magic-box-selected');
      if (selected != null) {
        selected.onclick(null);
      } else if (this.onEnterPress) {
        this.onEnterPress();
      }
      e.preventDefault();
    }

    public setText(text: string) {
      $(this.input).val(text);
      this.onChange();
    }

    public setCursor(index: number) {
      $(this.input).focus();
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

    public resultAtCursor(match?: string|{ (result: Result): boolean }): Result[] {
      return this.displayedResult.resultAt(this.getCursor(), match);
    }

    private setupHandler() {
      $(this.input).blur(() => { this.blur(); })
        .focus(() => { this.focus(); })
        .click((e) => { this.click(); })
        .select((e) => { this.click(); })
        .keydown((e) => { this.keydown(e); })
        .keyup((e) => { this.keyup(e); })
        .mouseenter(() => { this.mouseenter(); })
        .mouseleave(() => { this.mouseleave(); })
        .scroll(() => { this.updateScroll(false); })
      $(this.clear).click(() => {
        this.setText(''); this.setCursor(0);
        if (this.onClear != null) {
          this.onClear();
        }
      })
    }

    private blur() {
      this.hasFocus = false;
      setTimeout(() => {
        $(this.element).toggleClass('magic-box-hasFocus', this.hasFocus);
        if (!this.hasFocus && this.onBlur != null) {
          this.onBlur();
          if (this.onUpdateSuggestions != null && !this.inline) {
            this.onUpdateSuggestions([], null);
          }
        }
      }, 300);
      this.updateScroll();
    }

    private focus() {
      this.hasFocus = true;
      $(this.element).addClass('magic-box-hasFocus');
      requestAnimationFrame(() => {
        this.onChange();
      })
    }

    private click() {
      this.updateSuggestions();
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
          requestAnimationFrame(() => {
            this.onChange();
          })
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
          this.enterPress(e);
          break;
        default:
          this.updateSuggestions();
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

    private highligthed:Result;
    private highligth(result = this.displayedResult) {
      if(this.highligthed != result){
        this.highlightContainer.innerHTML = '';
        this.highlightContainer.appendChild(result.toHtmlElement());
        this.updateScroll(false);
        this.input.value = result.toString();
      }
    }

    private updateScrollDefer: number;
    private updateScroll(defer = true) {
      var callback = () => {
        if (this.underlay.clientWidth < this.underlay.scrollWidth) {
          this.underlay.style.visibility = 'hidden';
          this.underlay.scrollLeft = this.input.scrollLeft;
          this.underlay.scrollTop = this.input.scrollTop;
          this.underlay.style.visibility = 'visible';
        }
        if (this.hasFocus) {
          this.updateScroll();
        }
        this.updateScrollDefer = null;
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
        $(this.element).toggleClass('magic-box-notEmpty', text.length > 0);
        this.updateResult();
        this.highligth();
        this.updateSuggestions();
      }
    }

    private updateResult() {
      this.result = this.grammar.parse(this.text);
      this.displayedResult = this.result.clean();
    }
  }

  export function create(element: HTMLElement, grammar: Grammar, inline?:boolean) {
    return new Instance(element, grammar, inline);
  }

  export function requestAnimationFrame(callback: () => void) {
    if ('requestAnimationFrame' in window) {
      return window.requestAnimationFrame(callback);
    }
    return setTimeout(callback);
  }
}
module Coveo {
  export var $: JQueryStatic = Coveo['$'] || window['$'];
}

/// <reference path="MagicBox.ts"/>
module Coveo.MagicBox {

  export interface Suggestion {
    text?: string;
    index?: number;
    html?: string;
    dom?: HTMLElement;
    seperator?: string;
    onSelect?: () => void;
  }

  export class SuggestionsManager {
    private pendingSuggestion: JQueryDeferred<Suggestion[]>;

    constructor(private element: HTMLElement) {
    }

    public moveDown():Suggestion {
      var selected = this.element.querySelector('.magic-box-selected');
      if (selected != null) {
        $(selected).removeClass('magic-box-selected');
        selected = selected.nextElementSibling;
      } else {
        selected = this.element.firstElementChild;
      }
      while (selected && selected['suggestion'].onSelect == null) {
        selected = selected.nextElementSibling
      }
      $(selected).addClass('magic-box-selected');
      return selected && selected['suggestion'];
    }

    public moveUp():Suggestion {
      var selected = this.element.querySelector('.magic-box-selected');
      if (selected != null) {
        $(selected).removeClass('magic-box-selected');
        selected = selected.previousElementSibling;
      } else {
        selected = this.element.lastElementChild;
      }
      while (selected && selected['suggestion'].onSelect == null) {
        selected = selected.previousElementSibling;
      }
      $(selected).addClass('magic-box-selected');
      return selected && selected['suggestion'];
    }

    public select() {
      var selected = <HTMLElement>this.element.querySelector('.magic-box-selected');
      if (selected != null) {
        selected.onclick(null);
      }
      return selected;
    }

    public mergeSuggestions(suggestions: Array<JQueryPromise<Suggestion[]>|Suggestion[]>, callback?: (suggestions: Suggestion[]) => void) {
      if (this.pendingSuggestion != null) {
        this.pendingSuggestion.reject('');
      }
      var nbPending = suggestions.length;
      var results: Suggestion[] = [];
      var deferred = this.pendingSuggestion = $.Deferred<Suggestion[]>();

      _.each(suggestions, (suggestions: JQueryDeferred<Suggestion[]>|Suggestion[]) => {
        // We wrap the suggestions with a $.when
        $.when<Suggestion[]>(suggestions)
          .done((items: Suggestion[]) => {
            if (items != null) {
              results = results.concat(items);
            }
          })
          .always(() => {
            nbPending--;
            if (nbPending == 0) {
              // if we have trigger a new suggestions, we do not care about those results
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
      deferred.done((suggestions: Suggestion[]) => {
        callback && callback(suggestions);
        this.updateSuggestions(suggestions);
      });
    }

    public updateSuggestions(suggestions: Suggestion[]) {
      this.element.innerHTML = '';
      this.element.className = "magic-box-suggestions";
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
        } else {
          // this need to be done if the selection is in cache and the dom is set in the suggestion
          $(dom).removeClass('magic-box-selected');
        }
        dom.onclick = () => {
          suggestion.onSelect && suggestion.onSelect();
        }
        dom['suggestion'] = suggestion;
        this.element.appendChild(dom);
      });
      $(this.element).toggleClass('magic-box-hasSuggestion', suggestions.length > 0);
    }
  }
}

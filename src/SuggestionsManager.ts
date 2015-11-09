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

    constructor(private element: HTMLElement, private selectableClass: string = 'magic-box-suggestion', private selectedClass: string = 'magic-box-selected') {
    }

    public moveDown(): Suggestion {
      var selected = this.element.getElementsByClassName(this.selectedClass).item(0);
      var selectables = <NodeListOf<HTMLElement>> this.element.getElementsByClassName(this.selectableClass);
      var index: number = -1;
      if (selected != null) {
        $(selected).removeClass(this.selectedClass);
        for (var i = 0; i < selectables.length; i++) {
          if (selected == selectables.item(i)) {
            index = i;
            break;
          }
        }
        index = index == -1 ? 0 : index + 1;
      } else {
        index = 0;
      }
      selected = selectables.item(index);
      $(selected).addClass(this.selectedClass);
      return selected && selected['suggestion'];
    }

    public moveUp(): Suggestion {
      var selected = this.element.getElementsByClassName(this.selectedClass).item(0);
      var selectables = <NodeListOf<HTMLElement>> this.element.getElementsByClassName(this.selectableClass);
      var index: number = -1;
      if (selected != null) {
        $(selected).removeClass(this.selectedClass);
        for (var i = 0; i < selectables.length; i++) {
          if (selected == selectables.item(i)) {
            index = i;
            break;
          }
        }
        index = index == -1 ? selectables.length - 1 : index - 1;
      } else {
        index = selectables.length - 1;
      }
      selected = selectables.item(index);
      $(selected).addClass(this.selectedClass);
      return selected && selected['suggestion'];
    }

    public select() {
      var selected = this.element.getElementsByClassName(this.selectedClass).item(0);
      if (selected != null) {
        $(selected).trigger("keyboardSelect");
      }
      return selected;
    }

    public mergeSuggestions(suggestions: Array<JQueryPromise<Suggestion[]>|Suggestion[]>, callback?: (suggestions: Suggestion[]) => void) {
      if (this.pendingSuggestion != null) {
        this.pendingSuggestion.reject();
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
              deferred.resolve(results.sort((a, b) => b.index - a.index));
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
          $(dom).on("click keyboardSelect", suggestion.onSelect).addClass(this.selectableClass);
        } else {
          // this need to be done if the selection is in cache and the dom is set in the suggestion
          $(dom).removeClass('magic-box-selected');
        }
        if ($(dom).hasClass(this.selectableClass)) {
          dom.onmouseover = (e) => {
            if (e.target == dom) {
              var selected = this.element.getElementsByClassName(this.selectedClass);
              for(var i = 0; i < selected.length; i++){
                $(selected.item(i)).removeClass(this.selectedClass);
              }
              $(dom).addClass(this.selectedClass);
            }
          }
          dom.onmouseout = (e) => {
            if (e.target == dom) {
              $(dom).removeClass(this.selectedClass);
            }
          }
        }
        dom['suggestion'] = suggestion;
        this.element.appendChild(dom);
      });
      $(this.element).toggleClass('magic-box-hasSuggestion', suggestions.length > 0);
    }
  }
}

/// <reference path="../../bin/js/MagicBox/MagicBox.d.ts" />

module coveo.magicBox.Addons {
  export interface FieldDescription {
    type: string;
    name: string;

    fieldType: string;
    fieldSourceType: string;

    includeInQuery: boolean;

    groupByField: boolean;
    splitGroupByField: boolean;
    sortByField: boolean;
  }

  export interface FieldValue {
    value: string;
    numberOfResults: number;
  }

  export interface FieldAddonOption {
    getFields: () => JQueryPromise<FieldDescription[]>;
    getFieldValues: (field: string) => JQueryPromise<FieldDescription[]>;
  }
  
  /*
  export var FieldAddon = (magicBox: coveo.MagicBox, access_token: string) => {
    var fields: JQueryPromise<FieldDescription[]>;

    magicBox.addAutocomplete((magicBox) => {
      var resultAtCursor = magicBox.resultAtCursor();
      var current = _.first(resultAtCursor);
      if (current != null) {
        if (current.expression == magicBox.grammar.expressions['field'] || (current.expression == magicBox.grammar.expressions['word'] && current.value == '@')) {
          var currentField = current.value.toLowerCase().substr(1);
          var deferred = $.Deferred<coveo.MagicSuggestion[]>();
          getFields().done((fields: Fields) => {
            var matchFields = _.filter(fields.fields, (field) => field.includeInQuery && field.name.toLowerCase().substr(1).indexOf(currentField) != -1)
            matchFields = _.first(matchFields, 5);
            deferred.resolve(_.map(matchFields, (field) => {
              return {
                text: field.name,
                onSelect: () => {
                  current.value = field.name;
                  magicBox.setTextFromResult()
                }
              }
            }));
          })
          return deferred;
        }
        var fieldQuery = _.find(resultAtCursor, (result) => result.expression == magicBox.grammar.expressions['fieldQuery']);
        if (fieldQuery != null) {
          var fieldName = fieldQuery.subResults[0].value;
          var deferred = $.Deferred<coveo.MagicSuggestion[]>();
          getFields().done((fields: Fields) => {
            var field = _.find(fields.fields, (field) => {
              return field.groupByField && _.contains(["LargeString", "SmallString"], field.fieldType) && field.name.toLowerCase() == fieldName.toLowerCase()
            });
            if (field != null) {
              var fieldValue = fieldQuery.subResults[2];
              var currentValue = ''
              if (fieldValue.subResults != null) {
                if (fieldValue.subResults[0].expression == magicBox.grammar.expressions["fieldValueNoneSpace"]) {
                  currentValue = fieldValue.subResults[0].value;
                } else if (fieldValue.subResults[0].expression == magicBox.grammar.expressions["doubleQuoteString"]) {
                  currentValue = fieldValue.subResults[0].groups[0];
                }
              }
              $.get('https://cloudplatform.coveo.com/rest/search/values', {
                access_token: access_token,
                pattern: '.*' + currentValue + '.*',
                patternType: 'RegularExpression',
                sortCriteria: 'occurrences',
                field: field.name,
                maximumNumberOfValues: 5
              }).done((values: any) => {
                deferred.resolve(_.map(values.values, (value: any) => {
                  var stringValue: string = value.value;
                  return {
                    text: stringValue,
                    onSelect: () => {
                      if (/^\w+$/.test(stringValue)) {
                        fieldValue.value = stringValue;
                      } else {
                        fieldValue.value = JSON.stringify(stringValue);
                      }
                      fieldValue.subResults = null;
                      magicBox.setTextFromResult()
                    }
                  }
                }));
              })
            } else {
              deferred.resolve(null);
            }
          })
          return deferred;
        }
      }
      return null;
    })
  }
*/
}
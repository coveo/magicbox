/// <reference path="jquery.d.ts" />
/// <reference path="underscore.d.ts" />

/// <reference path="MagicBox.ts" />
/// <reference path="coveoGrammar.ts" />

/// <reference path="addons/FieldAddon.ts" />
/// <reference path="addons/RevealQuerySuggestAddon.ts" />



var access_token = '7b9b9300-3901-437b-bafd-51ae596f1b16';

var magicbox: coveo.MagicBox
$(() => {
  magicbox = new coveo.MagicBox($('.magic').get(0), coveoGrammar);
  RevealQuerySuggestAddon(magicbox, access_token);
  FieldAddon(magicbox, access_token);
})
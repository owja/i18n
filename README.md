![OWJA! i18n](resources/owja-i18n-logo.png)

[![npm version](https://img.shields.io/npm/v/@owja/i18n.svg)](https://badge.fury.io/js/%40owja%2Fioc)
[![codecov](https://codecov.io/gh/owja/i18n/branch/master/graph/badge.svg)](https://codecov.io/gh/owja/ioc)
[![Greenkeeper badge](https://badges.greenkeeper.io/owja/i18n.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/owja/i18n.svg?branch=master)](https://travis-ci.org/owja/ioc)
[![gzip size](http://img.badgesize.io/https://unpkg.com/@owja/i18n/dist/i18n.mjs?compression=gzip)](https://unpkg.com/@owja/i18n/dist/i18n.mjs)

This is a lightweight internationalization library which is in early **alpha** state. This means it is
work in progress, unstable, can contain bugs and the API can change until first stable release.

### Features

* lightweight gz bundle size <1kb
* no global state
* it is made with dependency injection in mind
* Build-in support for basic plurals, interpolation and context
* Extensible with plugins

##### What does it not have and why?

* No loading mechanism. Nowadays we have dynamic imports and fetch and both can do this
job perfectly.
* No namespaces. You can add translations while runtime without the need for namespaces.
If you want some kind of namespaces you can use multidimensional objects. 
* No nesting. Could be implemented with a plugin.
* Only one plural form (but numbers are suffixed too)
* No objects, no arrays.
* No formatting. Could be implemented with a plugin.

### Extensibility (Plugins)

There will be a few plugins on stable release. Planed are:

* Datetime Formatter, like `[[date|1558819424|short]]` to `05/25`
* Currency Formatter, like `[[cur|2.323122]]` to `€ 2,32`
* Number Formatter, like `[[decimal|2.323122|2]]` to `2,32`
* Html2Char Converter, for some useful codes like `&shy;` to `0x00AD`

The reason why this functionality is not included in the main bundle is that in
many cases they are not needed or you need only one or two and not all.

### Usage

##### Step 1 - Creating an instance of the Translator 

```ts
@import {Translator} from "@owja/i18n";
const translator = new Translator({default:"de",fallback:"en"});
```
If you using a dependency injection, you can bind the `.t()` method of the `translator` constant 
to make accessing the main functionality as easy as possible.

##### Step 2 - Importing Translations

a) Adding with static imports
```ts
import de from "lang/de.json";
import en from "lang/de.json";

translator.add("de", de);
translator.add("en", en);
```

b) Adding with dynamic imports
```ts
import("lang/de.json").then((m) => translator.add("de", m.default));
import("lang/en.json").then((m) => translator.add("en", m.default));
```

c) Adding with fetch
```ts
fetch("lang/de.json").then(r => r.json())
    .then((r) => translator.add("de", r));
    
fetch("lang/en.json").then(r => r.json())
    .then((r) => translator.add("en", r));
```

##### Step 3 - Translate something

*lang/de.json*
```json
{
  "hello": "Hallo Welt",
  "car": "Auto",
  "car_plural": "Autos",
  "employee_male": "Der Mitarbeiter",
  "employee_male_0": "Kein Mitarbeiter",
  "employee_male_plural": "Die Mitarbeiter",
  "employee_female": "Die Mitarbeiterin",
  "employee_female_0": "Keine Mitarbeiterinnen",
  "employee_female_plural": "Die Mitarbeiterinnen",
  "dashboard": {
    "button": "Ok"
  },
  "contact": {
    "button": "Senden"
  }
}
```

```ts
translate.t("hello"); // output: "Hallo Welt"
translate.t("car", {count: 2}); // output: "Autos"
translate.t("car", {count: 1}); // output: "Auto"
translate.t("employee", {count: 0, context: "male"}); // output: "Kein Mitarbeiter"
translate.t("employee", {count: 1, context: "male"}); // output: "Der Mitarbeiter"
translate.t("employee", {count: 2, context: "male"}); // output: "Die Mitarbeiter"
translate.t("employee", {count: 0, context: "female"}); // output: "Keine Mitarbeiterinnen"
translate.t("employee", {count: 1, context: "female"}); // output: "Die Mitarbeiterin"
translate.t("employee", {count: 2, context: "female"}); // output: "Die Mitarbeiterinnen"
translate.t("dashboard.button"}); // output: "Ok"
translate.t("contact.button"}); // output: "Senden"
```

##### Setting the Language and Listening

Setting the language:
```ts
translate.language("de");
```
Getting the language:
```ts
translate.language();
```
Listening to language change and unsubscribe:
```ts
// subscribe
const unsubscribe = translate.listen(() => alert("language was changed"));

// and this will unsubscribe the listener
unsubscribe();
```
> Note: The callback will get triggered on some other changes too in the future,
like new translation resources got added. This is not implemented yet.

### Inspiration

This library is made with inspiration of the well known [i18next](https://github.com/i18next/i18next) framework.
That's why it shares some similarities. 

### License

License under [Creative Commons Attribution 4.0 International](https://spdx.org/licenses/CC-BY-4.0.html)

Copyright © 2019 Hauke Broer

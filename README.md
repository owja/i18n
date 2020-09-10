![OWJA! i18n](resources/owja-i18n-logo.png)

[![npm version](https://img.shields.io/npm/v/@owja/i18n.svg)](https://badge.fury.io/js/%40owja%2Fi18n)
[![codecov](https://codecov.io/gh/owja/i18n/branch/master/graph/badge.svg)](https://codecov.io/gh/owja/i18n)
[![Build Status](https://travis-ci.org/owja/i18n.svg?branch=master)](https://travis-ci.org/owja/i18n)
[![size](https://img.badgesize.io/https://unpkg.com/@owja/i18n/index.module.js.svg?compression=brotli&label=size)](https://unpkg.com/@owja/i18n/index.module.js)

This is a lightweight internationalization library which is in early **alpha** state. This means it is
work in progress, unstable, can contain bugs and the API can change until first stable release.

### Features

* lightweight bundle size **less than 1 kb** (brotli compressed, without plugins)
* no global state
* it is made with dependency injection in mind
* Build-in support for plurals, interpolation and context
* uses Intl.Locale and Intl.PluralRules under the hood
* Extendable with plugins

##### What does it not have and why?

* No loading mechanism. Nowadays we have dynamic imports and fetch and both can do this
job perfectly
* No namespaces. You can add translations while runtime without the need for namespaces
If you want some kind of namespaces you can use multidimensional objects
* No nesting. Could be implemented with a plugin
* No objects, no arrays
* No formatting. Could be implemented with a plugin

### Extendability (Plugins)

There will be a few plugins on stable release. Planed are:

* **[done]** Datetime Formatter, like `[[date|1558819424|short]]` to `05/25`
* **[done]** Currency Formatter, like `[[cur|2.323122]]` to `€ 2,32`
* **[done]** Number Formatter, like `[[number|2.323122|2]]` to `2,32`
* **[todo]** Html2Char Converter, for some useful codes like `&shy;` to `0x00AD`

The reason why this functionality isn't included in the main bundle is that in
many cases they are not needed, or you need only one or two and not all.

### Usage

##### Step 1 - Creating an instance of the Translator 

```ts
import {Translator} from "@owja/i18n";
const translator = new Translator({default:"de",fallback:"en"});
```
If you use a [dependency injection tool](https://github.com/owja/ioc), you can bind the `.t()` method of the `translator` constant 
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
  "car_other": "Autos",
  "employee_male_0": "Kein Mitarbeiter",
  "employee_male_one": "Der Mitarbeiter",
  "employee_male_other": "Die Mitarbeiter",
  "employee_female_0": "Keine Mitarbeiterinnen",
  "employee_female_one": "Die Mitarbeiterin",
  "employee_female_other": "Die Mitarbeiterinnen",
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

`Intl.PluralRules` is used under the hood to get the rule for the current set locale.

For example this is in german and english:

* **-1** is `one`
* **1** is `one`
* **everything else** is `other`

...and in arabic:

* **less than -10** is `many`
* **-3 to -10** is `few`
* **-2** is `two`
* **-1** is `one`
* **0** is `zero`
* **1** is `one`
* **2** is `two`
* **3 to 10** is `few`
* **greater than 10** is `many`

##### Setting the Language and Listening

Setting the language:
```ts
translate.locale("de");                          // sets only the language and is guessing the region which will result in DE in this case
translate.locale("de-DE");                       // sets language and region
translate.locale(new Intl.Locale("de-DE"));      // sets language and region too
translate.locale("zh-Hant-HK");                  // sets language, script and region
translate.locale(new Intl.Locale("zh-Hant-HK")); // sets language, script and region too
```
Getting the language:
```ts
translate.short();   // short locale (language) like "en" or like "zh-Hant" if script was set
translate.long();    // long locale like "en-GB" or like "zh-Hant-HK" if script was set
translate.script();  // long script like "Hant" if script was set else it returns undefined
translate.region();  // region of the current locale like "DE" if "de" or "de-DE" was set
```

Listening to language change and unsubscribe:
```ts
// subscribe
const unsubscribe = translate.listen(() => alert("language was changed"));

// and this will unsubscribe the listener
unsubscribe();
```
> Note: The callback will get triggered on some other changes too,
like new translation resources or plugins got added.

### Inspiration

This library is made with inspiration of the well known [i18next](https://github.com/i18next/i18next) framework.

### License

**MIT**

Copyright © 2019 - 2020 Hauke Broer

import {ParsedTranslations, Translations} from "./types";

export function _maximize(locale: string | Intl.Locale): Intl.Locale {
    let localeObj = typeof locale === "string" ? new Intl.Locale(locale) : locale;

    const withScript = !!localeObj.script;
    localeObj = localeObj.maximize();

    // we only need script (only if it was passed), region and language
    localeObj = new Intl.Locale(locale.toString(), {
        script: withScript ? localeObj.script : undefined,
        region: localeObj.region,
        language: localeObj.language,
    });

    if (!localeObj.region || !localeObj.language) {
        console.warn(`[@owja/i18n] locale "${localeObj.toString()}" incomplete and can result in unexpected errors`);
    }

    return localeObj;
}

export function _parse(translations: Translations, base: string): ParsedTranslations {
    let parsed: ParsedTranslations = {};

    for (const prop of Object.keys(translations || {})) {
        const value = translations[prop];
        if (typeof value !== "string" && typeof value !== "object") continue;

        const key = `${base}.${prop}`;

        if (typeof value === "string") {
            if (/[^a-zA-Z0-9_\-]/.test(prop)) throw `only a-Z, 0-9, minus sign and underscore allowed: "${prop}"`;
            parsed[key] = value;
        } else {
            if (/[^a-zA-Z0-9\-]/.test(prop)) throw `only a-Z, minus sign and 0-9 allowed: "${prop}"`;
            parsed = {...parsed, ..._parse(value, key)};
        }
    }

    return parsed;
}

/**
 * Tests if a string is a valid language tag
 * returns the formatted tag
 *
 * https://en.wikipedia.org/wiki/IETF_language_tag
 */
export function _validateLanguageTag(tag: string): string {
    return new Intl.Locale(tag).toString();
}

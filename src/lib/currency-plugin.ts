import type {TranslatorPlugin} from "./translator";
import {Parser} from "./plugin-parser";

export function createCurrencyPlugin(
    forcedLocale?: string,
    defaultCurrency?: string,
    options?: Intl.NumberFormatOptions,
): TranslatorPlugin {
    options = {
        ...options,
        ...{style: "currency"},
    };
    return function (translated: string, _, translator) {
        const values = Parser(translated, "currency");
        const locale = forcedLocale || translator.long();

        values.forEach((value) => {
            const num: number = parseFloat(value.arguments[0] || "0");
            if (!isNaN(num)) {
                translated = translated.replace(
                    value.match,
                    new Intl.NumberFormat(locale.toString(), {
                        ...options,
                        ...{currency: value.arguments[1] || defaultCurrency || "USD"},
                    }).format(num),
                );
            }
        });

        return translated;
    };
}

import {TranslatorPlugin} from "./interfaces";
import Parser from "./plugin-parser";

export function createPlugin(
    locale: string,
    defaultCurrency: string,
    options: Intl.NumberFormatOptions = {},
): TranslatorPlugin {
    options = {
        ...options,
        ...{style: "currency"},
    };
    return function(translated: string) {
        const values = Parser(translated, "currency");

        values.forEach((value) => {
            let num: number = parseFloat(value.arguments[0] || "0");
            if (!isNaN(num)) {
                translated = translated.replace(
                    value.match,
                    new Intl.NumberFormat(locale, {
                        ...options,
                        ...{currency: value.arguments[1] || defaultCurrency},
                    }).format(num),
                );
            }
        });

        return translated;
    };
}

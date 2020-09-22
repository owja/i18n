import type {TranslatorPlugin} from "./types";
import {Parser} from "./plugin-parser";

export function createCurrencyPlugin(
    forcedLocale?: string,
    defaultCurrency?: string,
    numberFormatOptions?: Intl.NumberFormatOptions,
): TranslatorPlugin {
    const formatOptions = {
        ...numberFormatOptions,
        ...{style: "currency"},
    };

    return function (translated: string, options, usedLocale) {
        const values = Parser(translated, "currency");
        const locale = forcedLocale || usedLocale;

        values.forEach((value) => {
            const pattern: string | undefined = value.arguments[0];
            const currency: string = value.arguments[1] || defaultCurrency || "USD";

            let num: number;
            if (pattern === undefined) {
                num = 0;
            } else if (
                options.replace &&
                options.replace[pattern] !== undefined &&
                typeof options.replace[pattern] !== "object"
            ) {
                num = parseFloat(options.replace[pattern].toString()) || 0;
            } else {
                num = parseFloat(value.arguments[0]) || 0;
            }

            translated = translated.replace(
                value.match,
                new Intl.NumberFormat(locale.toString(), {
                    ...formatOptions,
                    ...{currency},
                }).format(num),
            );
        });

        return translated;
    };
}

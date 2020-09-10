import type {TranslatorPlugin} from "./types";
import {Parser} from "./plugin-parser";

export function createNumberPlugin(
    forcedLocale?: string,
    numberFormatOptions?: Intl.NumberFormatOptions,
): TranslatorPlugin {
    const formatOptions = {
        ...numberFormatOptions,
        ...{style: "decimal"},
    };

    return function (translated: string, options, translator) {
        const values = Parser(translated, "number");
        const locale = forcedLocale || translator.long();

        values.forEach((value) => {
            const pattern: string | undefined = value.arguments[0];
            const fractions: number | undefined =
                value.arguments[1] !== undefined ? parseInt(value.arguments[1], 10) : undefined;

            let num: number;
            if (pattern === undefined) {
                num = 0;
            } else if (
                options.replace &&
                options.replace[pattern] !== undefined &&
                typeof options.replace[pattern] !== "object"
            ) {
                num = parseFloat(options.replace[pattern].toString());
            } else {
                num = parseFloat(value.arguments[0]) || 0;
            }

            translated = translated.replace(
                value.match,
                new Intl.NumberFormat(locale.toString(), {
                    ...formatOptions,
                    minimumFractionDigits: fractions || formatOptions.minimumFractionDigits,
                    maximumFractionDigits: fractions || formatOptions.maximumFractionDigits,
                }).format(num),
            );
        });

        return translated;
    };
}

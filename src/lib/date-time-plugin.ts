import {TranslatorPlugin} from "./interfaces";
import Parser from "./plugin-parser";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export type Formats = {
    [type: string]: DateTimeFormatOptions;
};

export const defaultFormats: Formats = {
    short: {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    },
    medium: {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    },
    long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
    },
    extended: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "long",
    },
};

const reduceDateFormat = {
    hour: undefined,
    minute: undefined,
    second: undefined,
    timeZoneName: undefined,
};

const reduceTimeFormat = {
    year: undefined,
    month: undefined,
    day: undefined,
};

export function createDateTimePlugin(
    locale?: string,
    defaultTimezone?: string,
    defaultFormat?: string,
    formats?: Formats,
): TranslatorPlugin {
    return function (translated: string, options, translator) {
        if (!locale) {
            locale = translator.language();
        }

        const sets = [
            {
                type: "date",
                values: Parser(translated, "date"),
            },
            {
                type: "time",
                values: Parser(translated, "time"),
            },
            {
                type: "datetime",
                values: Parser(translated, "datetime"),
            },
        ];

        for (const set of sets) {
            let reduce: DateTimeFormatOptions = {};
            if (set.type === "date") {
                reduce = reduceDateFormat;
            } else if (set.type === "time") {
                reduce = reduceTimeFormat;
            }

            for (const value of set.values) {
                const pattern: string | undefined = value.arguments[0];
                const format: string = value.arguments[1] || defaultFormat || "short";
                const timeZone: string | undefined = value.arguments[2] || defaultTimezone;

                let date: Date;
                if (!pattern) {
                    date = new Date();
                } else if (options.replace && options.replace[pattern]) {
                    date = new Date(options.replace[pattern]);
                } else {
                    date = new Date(pattern);
                }

                translated = translated.replace(
                    value.match,
                    new Intl.DateTimeFormat(locale, {...(formats || defaultFormats)[format], ...reduce, timeZone}).format(date),
                );
            }
        }

        return translated;
    };
}

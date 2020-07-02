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
        hour: "2-digit",
        minute: "2-digit",
    },
    medium: {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    },
    long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    },
    extended: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
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
    hour: undefined,
    minute: undefined,
    second: undefined,
    timeZoneName: undefined,
};

export function createDateTimePlugin(
    locale: string,
    defaultFormat?: string,
    defaultTimezone?: string,
    formats?: Formats,
): TranslatorPlugin {
    return function (translated: string, options) {
        const sets = [
            {
                type: "date",
                values: Parser(translated, "date"),
            },
            {
                type: "time",
                values: Parser(translated, "date"),
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
                let pattern: string | undefined = value.arguments[0];
                let format: string = value.arguments[1] || defaultFormat || "short";
                let timeZone: string | undefined = value.arguments[2] || defaultTimezone;

                if (!formats) {
                    formats = defaultFormats;
                }

                if (pattern && formats.hasOwnProperty(pattern)) {
                    timeZone = format;
                    format = pattern;
                    pattern = undefined;
                }

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
                    new Intl.DateTimeFormat(locale, {...formats[format], ...reduce, timeZone}).format(date),
                );
            }
        }

        return translated;
    };
}

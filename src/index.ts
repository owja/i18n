// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type {Locale as FormatJsLocale, IntlLocaleOptions} from "@formatjs/intl-locale";
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Intl {
        type Locale = FormatJsLocale;
        const Locale: {
            new (tag?: string, options?: IntlLocaleOptions): Locale;
        };
    }
}

export * from "./lib/translator";

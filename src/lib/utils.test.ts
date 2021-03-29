import {_maximize, _validateLanguageTag} from "./utils";

describe("Translator Utilities", () => {
    describe("validateLanguageTag", () => {
        test("validateLanguageTag should return expected strings", () => {
            expect(_validateLanguageTag("de")).toBe("de");
            expect(_validateLanguageTag("de-DE")).toBe("de-DE");
            expect(_validateLanguageTag("DE-DE")).toBe("de-DE");
            expect(_validateLanguageTag("DE")).toBe("de");
        });

        test("validateLanguageTag should throw with bad format", () => {
            expect(() => _validateLanguageTag("de_DE")).toThrow();
        });
    });

    describe("maximize", () => {
        const log = console.log;
        let logSpy: jest.Mock;
        afterEach(() => (console.log = log));
        beforeEach(() => {
            logSpy = jest.fn();
            console.log = logSpy;
        });

        test("should be able to maximize German", () => {
            const de = _maximize("de");
            expect(de.language).toBe("de");
            expect(de.region).toBe("DE");
            expect(de.script).toBe(undefined);
            expect(logSpy).not.toBeCalled();
        });

        test("should be able to maximize English", () => {
            const de = _maximize("en");
            expect(de.language).toBe("en");
            expect(de.region).toBe("US");
            expect(de.script).toBe(undefined);
            expect(logSpy).not.toBeCalled();
        });

        test("should be able to maximize UK English", () => {
            const de = _maximize("en-UK");
            expect(de.language).toBe("en");
            expect(de.region).toBe("UK");
            expect(de.script).toBe(undefined);
            expect(logSpy).not.toBeCalled();
        });

        test("should be able to maximize Azerbaijani", () => {
            const de = _maximize("az");
            expect(de.language).toBe("az");
            expect(de.region).toBe("AZ");
            expect(de.script).toBe(undefined);
            expect(de.toString()).toBe("az-AZ");
            expect(logSpy).not.toBeCalled();
        });

        test("should be able to maximize Azerbaijani with script", () => {
            const de = _maximize("az-Cyrl");
            expect(de.language).toBe("az");
            expect(de.region).toBe("AZ");
            expect(de.script).toBe("Cyrl");
            expect(de.toString()).toBe("az-Cyrl-AZ");
            expect(logSpy).not.toBeCalled();
        });

        test("should be able to maximize Azerbaijani with script and region", () => {
            const de = _maximize("az-Latn-AZ");
            expect(de.language).toBe("az");
            expect(de.region).toBe("AZ");
            expect(de.script).toBe("Latn");
            expect(de.toString()).toBe("az-Latn-AZ");
            expect(logSpy).not.toBeCalled();
        });

        test("should return a locale but print a warning on bad locales or if something goes wrong", () => {
            const de = _maximize("XX");
            expect(de.language).toBe("xx");
            expect(de.region).toBe(undefined);
            expect(de.script).toBe(undefined);
            expect(de.toString()).toBe("xx");
            expect(logSpy).toBeCalledWith('[@owja/i18n] locale "xx" incomplete');
        });
    });
});

import {_maximize, _validateLanguageTag} from "./utils";

describe("Translator Utilities", () => {
    test("validateLanguageTag should return expected strings", () => {
        expect(_validateLanguageTag("de")).toBe("de");
        expect(_validateLanguageTag("de-DE")).toBe("de-DE");
        expect(_validateLanguageTag("DE-DE")).toBe("de-DE");
        expect(_validateLanguageTag("DE")).toBe("de");
    });

    test("validateLanguageTag should throw with bad format", () => {
        expect(() => _validateLanguageTag("de_DE")).toThrow();
    });

    test("maximize should throw on invalid language/region", () => {
        expect(() => _maximize("XX")).toThrow('locale "xx" incomplete');
    });
});

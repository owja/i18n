import {_validateLanguageTag} from "./utils";

describe("Translator Utilities", () => {
    test("validateLanguageTag should return expected strings", () => {
        expect(_validateLanguageTag("de")).toBe("de");
        expect(_validateLanguageTag("de-DE")).toBe("de-DE");
        expect(_validateLanguageTag("DE-DE")).toBe("de-DE");
        expect(_validateLanguageTag("DE")).toBe("de");
    });

    test("validateLanguageTag should throw with bad format", () => {
        let thrown = false;
        try {
            _validateLanguageTag("de_DE");
        } catch {
            thrown = true;
        }
        expect(thrown).toBe(true);
    });
});

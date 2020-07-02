import {TranslatorPlugin, Translator} from "../";
import {createCurrencyPlugin} from "../plugins";

describe("Currency Plugin", () => {
    let plugin: TranslatorPlugin;

    test("can parse [[currency]] to 0,00 €", () => {
        plugin = createCurrencyPlugin("de-DE", "EUR");
        [
            {q: "xxxx [[currency]] xxx [[currency]]", e: "xxxx 0,00 € xxx 0,00 €"},
            {q: "xxxx [[currency|5]] xxx [[currency]]", e: "xxxx 5,00 € xxx 0,00 €"},
            {q: "xxxx [[currency|3.234]] xxx [[currency]]", e: "xxxx 3,23 € xxx 0,00 €"},
            {q: "xxxx [[currency|3|USD]] xxx [[currency]]", e: "xxxx 3,00 $ xxx 0,00 €"},
            {q: "xxxx [[currency|3.234]] xxx [[currency|12312341234|CNY]]", e: "xxxx 3,23 € xxx 12.312.341.234,00 CN¥"},
        ].forEach((test) => {
            expect(plugin(test.q, {}, new Translator())).toBe(test.e);
        });
    });
});

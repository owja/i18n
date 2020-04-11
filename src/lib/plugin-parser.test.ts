import Parser from "./plugin-parser";

describe("Plugin Parser", () => {
    test("can find pattern", () => {
        [
            {s: "", v: []},
            {s: "xxx [[etst]]", v: []},
            {s: "xxx", v: []},
            {s: "xxx [[test]]", v: [{match: "[[test]]", arguments: []}]},
            {s: "xxx [[test]] xxx", v: [{match: "[[test]]", arguments: []}]},
            {s: "xxx [[test|2|yyy]]", v: [{match: "[[test|2|yyy]]", arguments: ["2", "yyy"]}]},
            {s: "xxx [[test|2|yyy]] xxx", v: [{match: "[[test|2|yyy]]", arguments: ["2", "yyy"]}]},
            {
                s: "xxx [[test]] [[test]]",
                v: [
                    {match: "[[test]]", arguments: []},
                    {match: "[[test]]", arguments: []},
                ],
            },
            {
                s: "xxx [[test]] [[test]] xxx",
                v: [
                    {match: "[[test]]", arguments: []},
                    {match: "[[test]]", arguments: []},
                ],
            },
            {s: "xxx [[test|2]][[test2|4]]", v: [{match: "[[test|2]]", arguments: ["2"]}]},
            {s: "xxx [[test|2|yyy]] xx [test2|4]]", v: [{match: "[[test|2|yyy]]", arguments: ["2", "yyy"]}]},
            {s: "[[test|2|yyy]][test2|4]]", v: [{match: "[[test|2|yyy]]", arguments: ["2", "yyy"]}]},
            {s: "[[test]][test2|4]]", v: [{match: "[[test]]", arguments: []}]},
            {
                s: "[[test]][[test]]",
                v: [
                    {match: "[[test]]", arguments: []},
                    {match: "[[test]]", arguments: []},
                ],
            },
            {s: "[[test]]", v: [{match: "[[test]]", arguments: []}]},
            {s: "xxx [[test]][[TEST]]", v: [{match: "[[test]]", arguments: []}]},
        ].forEach((test) => {
            expect(Parser(test.s, "test")).toEqual(test.v);
        });
    });
});

interface Value {
    match: string;
    arguments: string[];
}

export function Parser(translated: string, find: string): Value[] {
    const search = new RegExp("(\\[\\[(" + find + ")(\\|(.*?))?\\]\\])", "gm");
    const values: Value[] = [];

    let m;
    while ((m = search.exec(translated)) !== null) {
        if (m.index === search.lastIndex) {
            search.lastIndex++;
        }

        values.push({
            match: m[0],
            arguments: m[4] !== undefined ? m[4].split("|") : [],
        });
    }

    return values;
}

import languages from './data/perLanguages.json' with { type: 'json' };

export function lookupLanguage(id) {
    const alpha3BMatch = languages.find((item) => item.id === id);
    if (alpha3BMatch) return alpha3BMatch;

    const alpha3TMatch = languages.find((item) => item.idB === id);
    if (alpha3TMatch) return alpha3TMatch;

    console.log('! Missing Locale___________:', id);
}

export function tabToJson(tabDelimitedText) {
    const lines = tabDelimitedText.trim().split('\n');
    const headers = lines[0].split('\t').map((header) => header.trim());
    const jsonObjects = lines.slice(1).map((line, index) => {
        const values = line.split('\t');
        if (values.length !== headers.length) {
            console.warn(`Row ${index + 2} has ${values.length} columns, expected ${headers.length}`);
        }
        const record = {};
        for (const [headerIndex, header] of headers.entries()) {
            record[header] = values[headerIndex]?.trim() ?? '';
        }
        return record;
    });

    return jsonObjects;
}

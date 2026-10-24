// ── External Dependencies & Registrations
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import avsc, { type Schema } from 'avsc'; // A CommonJS package, so Node only offers its default export.
import { parquetWriteBuffer } from 'hyparquet-writer';
import { tableFromArrays, tableToIPC } from 'apache-arrow';

// ── Types ────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface Person {
    id: number;
    name: string;
    city: string;
    joined: string;
    score: number;
    isActive: boolean;
}

interface SavVariable {
    format: number; // SPSS print and write format: type, width and decimals packed into one number.
    name: string;
    value: (person: Person) => number | string;
    width: number; // 0 for a number, otherwise the text width in bytes.
}

// ── Constants ────────────────────────────────────────────────────────────────────────────────────────────────────────

// Writes the people samples in 'Type Samples/people', for testing file type, encoding and delimiter detection. The
// README and the four workbooks ('.xlsx', '.xlsm', '.ods' and '.xls') are not written: the README is written by hand,
// and the workbooks need SheetJS, which is no longer published to npm. SQLite files are written by the 'sqlite3'
// command, which macOS includes.
const OUTPUT_DIRECTORY = './public/fileStore/Type Samples/people';
const PREVIEW_BYTE_COUNT = 4096; // The file previewer reads this much of a file.

// ── People ─ The same 20 people in every file, so results can be compared across formats. Accented names test
// encodings, and 'Smith, John' tests a quoted delimiter.
const CITIES = ['London', 'Orléans', 'Zürich', 'Montréal', 'Leeds', 'Nîmes', 'Boston', 'Kraków', 'Málaga', 'Oslo'];
const NAMES = [
    'Ada Lovelace',
    'Hélène Dubois',
    'Smith, John',
    'Zoë Müller',
    'Grace Hopper',
    'Noël Béranger',
    'Katherine Johnson',
    'Łukasz Nowak',
    'José García',
    'Ingrid Ødegård',
    'Alan Turing',
    'Chloé Martin',
    'Mary Jones',
    'Søren Kierkegaard',
    'Peter Brown',
    'Renée Lefèvre',
    'Tim Berners-Lee',
    'Ana Ruíz',
    'Barbara Liskov',
    'Björk Guðmundsdóttir'
];
const PEOPLE: Person[] = NAMES.map((name, index) => ({
    id: index + 1,
    name,
    city: CITIES[index % CITIES.length] ?? '',
    joined: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    score: Math.round((50 + ((index * 37) % 50) + index / 10) * 100) / 100,
    isActive: index % 3 !== 0
}));
const COLUMN_KEYS = ['id', 'name', 'city', 'joined', 'score', 'isActive'] as const;

// ── Text Samples ─ Prose and markdown, written as they would be by hand.
const PROSE_TEXT = `Ada Lovelace wrote the first published algorithm for a machine, more than a century before one was built.
Grace Hopper, decades later, wrote the first compiler and helped design COBOL.
Hélène Dubois, Zoë Müller and Noël Béranger joined the team last spring.
None of this is a table; it is just prose, though some lines hold a comma.
`;
const MARKDOWN_TEXT = `# Team Report

The team grew from **four** to **twenty** people this year.

## Highlights

- Offices opened in *Orléans* and *Zürich*.
- Ada Lovelace led the first project.

## Cities

| City | People |
| ---- | ------ |
| London | 2 |
| Orléans | 2 |
`;

// ── Initialisation ───────────────────────────────────────────────────────────────────────────────────────────────────

// ── Delimited Text ─ One delimiter per file, and the same CSV under extensions that do not say it is CSV.
await writeSample('people.csv', constructDelimitedText(','));
await writeSample('people-semicolon.csv', constructDelimitedText(';'));
await writeSample('people-crlf.csv', constructDelimitedText(',', '\r\n'));
await writeSample('people.tsv', constructDelimitedText('\t'));
await writeSample('people.tab', constructDelimitedText('\t'));
await writeSample('people-tab-delimited.txt', constructDelimitedText('\t')); // As Excel's 'Text (Tab delimited)' saves it.
await writeSample('people-pipe.dat', constructDelimitedText('|'));
await writeSample('people-colon.dat', constructDelimitedText(':').replaceAll(/(\d{4})-(\d{2})-(\d{2})/g, '$1$2$3')); // Dates lose their dashes too, so ':' is the only delimiter.
await writeSample('people-comma', constructDelimitedText(',')); // No extension.
await writeSample('people-csv-content.md', constructDelimitedText(',')); // Delimited data under a markdown extension.
await writeSample('people-ragged.csv', constructRaggedText());
await writeSample('people-iso-8859-1.csv', Buffer.from(constructDelimitedText(',').replaceAll('Ł', 'L'), 'latin1')); // 'Ł' has no ISO-8859-1 form.
await writeSample('people-utf-8-bom.csv', Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(constructDelimitedText(','))]));

// ── Parsing ─ Quotes that break the CSV rules, which strict parsing reports as errors, and valid files at the edges.
await writeSample('people-stray-quote.csv', constructDelimitedText(',').replace('Peter Brown', 'Peter "Pete" Brown')); // A quote inside an unquoted value.
await writeSample('people-text-after-quote.csv', constructDelimitedText(',').replace('Tim Berners-Lee', '"Tim" Berners-Lee'));
await writeSample('people-unclosed-quote.csv', constructDelimitedText(',').replace('Mary Jones', '"Mary Jones')); // The quote runs on to the end of the file.
await writeSample('people-multiline.csv', constructDelimitedText(',').replace('Grace Hopper', '"Grace\nHopper"')); // Valid: a quoted value can hold a line break.
await writeSample('people-multiline-preview-cut.csv', constructPreviewCutText());
await writeSample('people-single-column.csv', `name\n${PEOPLE.map((person) => (person.name.includes(',') ? `"${person.name}"` : person.name)).join('\n')}\n`);
await writeSample('people-empty.csv', '');

// ── JSON
await writeSample('people.json', `${JSON.stringify(PEOPLE, undefined, 2)}\n`);
await writeSample('people-minified.json', JSON.stringify(Array.from({ length: 10 }, () => PEOPLE).flat())); // One line, longer than the 4 KB preview.
await writeSample('people.jsonl', `${PEOPLE.map((person) => JSON.stringify(person)).join('\n')}\n`);
await writeSample('people-json-content.txt', `${JSON.stringify(PEOPLE, undefined, 2)}\n`); // JSON under a text extension.

// ── Plain Text and Markdown
await writeSample('people-prose.txt', PROSE_TEXT);
await writeSample('people-markdown.md', MARKDOWN_TEXT);

// ── XML ─ No encoding stated, so UTF-8. An encoding stated in the declaration. UTF-16 with a byte order mark.
await writeSample('people.xml', constructXMLText('<?xml version="1.0"?>'));
await writeSample('people-iso-8859-1.xml', Buffer.from(constructXMLText('<?xml version="1.0" encoding="ISO-8859-1"?>').replaceAll('Ł', 'L'), 'latin1'));
await writeSample('people-utf-16.xml', Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(constructXMLText('<?xml version="1.0" encoding="UTF-16"?>'), 'utf16le')]));

// ── Columnar, Record and Database Files
await writeSample('people.arrow', tableToIPC(tableFromArrays(Object.fromEntries(COLUMN_KEYS.map((key) => [key, PEOPLE.map((person) => person[key])]))), 'file'));
await writeSample('people.parquet', Buffer.from(constructParquetBuffer()));
await writeAvroSample('people.avro');
writeSQLiteSample('people.sqlite');
await writeSample('people.sav', constructSavBuffer());

console.info(`✅ People samples written to '${OUTPUT_DIRECTORY}'.`);

// ── Helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────────

async function writeSample(name: string, content: string | Uint8Array): Promise<void> {
    await fs.writeFile(`${OUTPUT_DIRECTORY}/${name}`, content);
}

// A value holding the delimiter or a quote is quoted, with its quotes doubled, as CSV does.
function constructDelimitedText(delimiter: string, lineBreak = '\n'): string {
    const quote = (value: boolean | number | string): string => {
        const text = String(value);
        return text.includes(delimiter) || text.includes('"') ? `"${text.replaceAll('"', '""')}"` : text;
    };
    const rows = [COLUMN_KEYS.map((key) => key), ...PEOPLE.map((person) => COLUMN_KEYS.map((key) => person[key]))];
    return rows.map((row) => row.map((value) => quote(value)).join(delimiter)).join(lineBreak) + lineBreak;
}

// Valid CSV whose quoted, multi-line value spans byte 4096, where the 4 KB preview ends. The preview stops at the last
// line break before it, which falls inside the value, so the preview sees a quote that is never closed.
function constructPreviewCutText(): string {
    const lines = [COLUMN_KEYS.join(',')];
    let id = 1;
    while (`${lines.join('\n')}\n`.length < PREVIEW_BYTE_COUNT - 200) {
        const person = PEOPLE[(id - 1) % PEOPLE.length] ?? PEOPLE[0];
        lines.push([String(id), 'Mary Jones', person?.city ?? '', person?.joined ?? '', String(person?.score ?? 0), String(person?.isActive ?? false)].join(','));
        id++;
    }
    const noteLines = Array.from({ length: 30 }, (_, index) => `Note line ${String(index + 1)}`);
    lines.push(`${String(id)},"${noteLines.join('\n')}",London,2026-01-01,50,true`, `${String(id + 1)},Ada Lovelace,London,2026-01-02,51,true`);
    return `${lines.join('\n')}\n`;
}

// Two rows lose their last values, as a hand-edited file might.
function constructRaggedText(): string {
    const lines = constructDelimitedText(',').trimEnd().split('\n');
    const raggedLines = lines.map((line, index) => {
        if (index === 5) return line.split(',').slice(0, 4).join(',');
        if (index === 12) return line.split(',').slice(0, 5).join(',');
        return line;
    });
    return `${raggedLines.join('\n')}\n`;
}

function constructXMLText(declaration: string): string {
    const elements = PEOPLE.map(
        (person) =>
            `  <person id="${String(person.id)}"><name>${person.name}</name><city>${person.city}</city><joined>${person.joined}</joined><score>${String(person.score)}</score><isActive>${String(person.isActive)}</isActive></person>`
    );
    return `${declaration}\n<people>\n${elements.join('\n')}\n</people>\n`;
}

function constructParquetBuffer(): ArrayBuffer {
    return parquetWriteBuffer({
        columnData: [
            { name: 'id', data: PEOPLE.map((person) => person.id), type: 'INT32' },
            { name: 'name', data: PEOPLE.map((person) => person.name), type: 'STRING' },
            { name: 'city', data: PEOPLE.map((person) => person.city), type: 'STRING' },
            { name: 'joined', data: PEOPLE.map((person) => person.joined), type: 'STRING' },
            { name: 'score', data: PEOPLE.map((person) => person.score), type: 'DOUBLE' },
            { name: 'isActive', data: PEOPLE.map((person) => person.isActive), type: 'BOOLEAN' }
        ]
    });
}

async function writeAvroSample(name: string): Promise<void> {
    const schema: Schema = {
        type: 'record',
        name: 'Person',
        fields: [
            { name: 'id', type: 'int' },
            { name: 'name', type: 'string' },
            { name: 'city', type: 'string' },
            { name: 'joined', type: 'string' },
            { name: 'score', type: 'double' },
            { name: 'isActive', type: 'boolean' }
        ]
    };
    await new Promise<void>((resolve, reject) => {
        const encoder = avsc.createFileEncoder(`${OUTPUT_DIRECTORY}/${name}`, schema);
        encoder.on('finish', () => {
            resolve();
        });
        encoder.on('error', reject);
        for (const person of PEOPLE) encoder.write(person);
        encoder.end();
    });
}

// The 'sqlite3' command writes into an existing file, so any earlier sample is removed first.
function writeSQLiteSample(name: string): void {
    const sqlValue = (value: boolean | number | string): string => {
        if (typeof value === 'string') return `'${value.replaceAll("'", "''")}'`;
        if (typeof value === 'boolean') return value ? '1' : '0';
        return String(value);
    };
    const filePath = `${OUTPUT_DIRECTORY}/${name}`;
    execFileSync('rm', ['-f', filePath]);
    const inserts = PEOPLE.map((person) => `INSERT INTO people VALUES (${COLUMN_KEYS.map((key) => sqlValue(person[key])).join(', ')});`);
    const sql = `CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT, city TEXT, joined TEXT, score REAL, isActive INTEGER);\n${inserts.join('\n')}\n`;
    execFileSync('sqlite3', [filePath], { input: sql });
}

// An uncompressed SPSS system file, written from the format's layout because no npm package writes one. Its text
// encoding is recorded as UTF-8. Numbers are 8-byte floats, and text is padded with spaces to a multiple of 8 bytes.
function constructSavBuffer(): Buffer {
    const variables: SavVariable[] = [
        { format: (5 << 16) | (8 << 8), name: 'ID', value: (person) => person.id, width: 0 },
        { format: (1 << 16) | (32 << 8), name: 'NAME', value: (person) => person.name, width: 32 },
        { format: (1 << 16) | (16 << 8), name: 'CITY', value: (person) => person.city, width: 16 },
        { format: (1 << 16) | (16 << 8), name: 'JOINED', value: (person) => person.joined, width: 16 },
        { format: (5 << 16) | (8 << 8) | 2, name: 'SCORE', value: (person) => person.score, width: 0 },
        { format: (5 << 16) | (8 << 8), name: 'ISACTIVE', value: (person) => (person.isActive ? 1 : 0), width: 0 }
    ];
    const countSlots = (variable: SavVariable): number => (variable.width === 0 ? 1 : Math.ceil(variable.width / 8));
    const int32 = (value: number): Buffer => {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value);
        return buffer;
    };
    const float64 = (value: number): Buffer => {
        const buffer = Buffer.alloc(8);
        buffer.writeDoubleLE(value);
        return buffer;
    };
    const text = (value: string, length: number): Buffer => {
        const buffer = Buffer.alloc(length, 0x20);
        buffer.write(value, 'utf8');
        return buffer;
    };
    const caseSlotCount = variables.reduce((sum, variable) => sum + countSlots(variable), 0);
    const parts: Buffer[] = [
        Buffer.from('$FL2'),
        text('@(#) IBM SPSS STATISTICS DPUse sample', 60),
        int32(2), // Layout code.
        int32(caseSlotCount),
        int32(0), // Not compressed.
        int32(0), // No weight variable.
        int32(PEOPLE.length),
        float64(100), // Compression bias.
        text('22 Oct 26', 9),
        text('14:00:00', 8),
        text('People sample data', 64),
        Buffer.alloc(3)
    ];
    for (const variable of variables) {
        parts.push(int32(2), int32(variable.width), int32(0), int32(0), int32(variable.format), int32(variable.format), text(variable.name, 8));
        for (let slot = 1; slot < countSlots(variable); slot++) parts.push(int32(2), int32(-1), int32(0), int32(0), int32(0), int32(0), text('', 8)); // Continues a long text variable.
    }
    parts.push(int32(7), int32(3), int32(4), int32(8), ...[1, 0, 0, -1, 1, 1, 2, 65_001].map((value) => int32(value))); // Machine integer info: IEEE floats, little-endian, character code 65001 (UTF-8).
    parts.push(int32(7), int32(20), int32(1), int32(5), Buffer.from('UTF-8')); // Character encoding record.
    parts.push(int32(999), int32(0)); // End of the dictionary.
    for (const person of PEOPLE) {
        for (const variable of variables) {
            const value = variable.value(person);
            parts.push(typeof value === 'number' ? float64(value) : text(value, countSlots(variable) * 8));
        }
    }
    return Buffer.concat(parts);
}

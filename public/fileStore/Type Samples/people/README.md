# People Samples

Sample files for testing file type, encoding and delimiter detection. Every file holds the same 20 people, so results
can be compared across formats. Each person has an `id`, `name`, `city`, `joined` date, `score` and `isActive` flag.
Some names carry accents (Hélène, Zoë, Łukasz) to test encodings, and `Smith, John` tests a quoted comma.

## Detected by content

Files `file-type` identifies from their first bytes.

| File                    | Tests                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| `people.arrow`          | Apache Arrow IPC file                                                  |
| `people.avro`           | Apache Avro object container file                                      |
| `people.ods`            | OpenDocument spreadsheet                                               |
| `people.parquet`        | Apache Parquet                                                         |
| `people.sav`            | SPSS system file, with its text encoding recorded as UTF-8             |
| `people.sqlite`         | SQLite database with one `people` table                                |
| `people.xlsx`           | Excel workbook                                                         |
| `people.xlsm`           | Excel macro-enabled workbook, with its content types entry last        |
| `people.xls`            | Excel 97–2003 workbook, which `file-type` reports as the generic `cfb` |
| `people.xml`            | XML with no encoding stated, so UTF-8                                  |
| `people-iso-8859-1.xml` | XML stating `encoding="ISO-8859-1"` in its declaration                 |
| `people-utf-16.xml`     | XML in UTF-16 little-endian with a byte order mark                     |

## Delimited text

| File                       | Tests                                                                  |
| -------------------------- | ---------------------------------------------------------------------- |
| `people.csv`               | Comma-delimited, with a quoted value holding a comma                   |
| `people-semicolon.csv`     | Semicolon-delimited under a `.csv` extension                           |
| `people-crlf.csv`          | Windows line endings (CRLF)                                            |
| `people-ragged.csv`        | Two rows missing their last values                                     |
| `people-utf-8-bom.csv`     | UTF-8 with a byte order mark                                           |
| `people-iso-8859-1.csv`    | Single-byte ISO-8859-1 rather than UTF-8                               |
| `people.tsv`               | Tab-delimited                                                          |
| `people.tab`               | Tab-delimited under a `.tab` extension                                 |
| `people-tab-delimited.txt` | Tab-delimited under `.txt`, as Excel's 'Text (Tab delimited)' saves it |
| `people-pipe.dat`          | Pipe-delimited under `.dat`                                            |
| `people-colon.dat`         | Colon-delimited under `.dat`, with dates written without dashes        |
| `people-comma`             | Comma-delimited with no extension                                      |
| `people-csv-content.md`    | Comma-delimited content under a markdown extension                     |

## JSON

| File                      | Tests                                                    |
| ------------------------- | -------------------------------------------------------- |
| `people.json`             | An array of objects, pretty-printed                      |
| `people-minified.json`    | One line, longer than the 4 KB preview, so it is cut off |
| `people.jsonl`            | JSON Lines, one object per line                          |
| `people-json-content.txt` | JSON under a `.txt` extension                            |

## Plain text and markdown

| File                 | Tests                                                       |
| -------------------- | ----------------------------------------------------------- |
| `people-prose.txt`   | Prose that is not delimited, though most lines hold a comma |
| `people-markdown.md` | Markdown with headings, a list and a table                  |

## Known issues

What detection gets wrong today, with the released file previewer and CSV parser:

- `people-iso-8859-1.csv` is guessed as Windows-1250, so 'Hélène' reads as 'Hélčne'.
- `people.jsonl` is reported as plain text, because JSON Lines is not detected yet.
- `people-prose.txt` is reported as comma-delimited, because most of its lines hold exactly one comma.
- `people-csv-content.md` is reported as markdown, because its extension decides. Reading it as delimited text needs the
  user to override the format.
- `people.xlsm` is reported as `xlsx` from the 4 KB preview, because its content types entry comes last.

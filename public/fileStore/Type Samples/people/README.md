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

## Parsing

Files are parsed strictly: a quote that breaks the CSV rules is reported as an error, in the preview and the full read
alike.

| File                               | Tests                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `people-stray-quote.csv`           | A quote inside an unquoted value, `Peter "Pete" Brown`. Reported as an error.        |
| `people-text-after-quote.csv`      | Text after a closing quote, `"Tim" Berners-Lee`. Reported as an error.               |
| `people-unclosed-quote.csv`        | A quote opened before `Mary Jones` and never closed. Reported as an error.           |
| `people-multiline.csv`             | A valid quoted value holding a line break, `"Grace` / `Hopper"`.                     |
| `people-multiline-preview-cut.csv` | A valid quoted value of several lines across byte 4096, where the 4 KB preview ends. |
| `people-single-column.csv`         | One column of names, so no delimiter is found.                                       |
| `people-empty.csv`                 | An empty file, read as delimited text with no rows.                                  |

## JSON

| File                      | Tests                                                    |
| ------------------------- | -------------------------------------------------------- |
| `people.json`             | An array of objects, pretty-printed                      |
| `people-minified.json`    | One line, longer than the 4 KB preview, so it is cut off |
| `people.jsonl`            | JSON Lines, one object per line                          |
| `people-json-content.txt` | JSON under a `.txt` extension                            |

## Plain text and markdown

| File                 | Tests                                      |
| -------------------- | ------------------------------------------ |
| `people-prose.txt`   | Prose with one comma on most lines         |
| `people-markdown.md` | Markdown with headings, a list and a table |

`people-prose.txt` is read as comma-delimited, by design. A two-column data file looks the same, and data files come
first, so for prose the user overrides the format.

## Known issues

What detection gets wrong today, with the released file previewer and CSV parser:

- `people-iso-8859-1.csv` is guessed as Windows-1250, so 'Hélène' reads as 'Hélčne'.
- `people-csv-content.md` is reported as markdown, because its extension decides. Reading it as delimited text needs the
  user to override the format.
- `people.xlsm` is reported as `xlsx` from the 4 KB preview, because its content types entry comes last.
- `people-unclosed-quote.csv` shows 13 rows in the preview, because the preview takes a quote still open at its end
  for a value cut off by the 4 KB limit, even when the whole file fits. The full read reports the error.
- `people-single-column.csv` is read as space-delimited, because most names are two words.
- `people-empty.csv` fails in the full read with an internal error rather than giving no rows.

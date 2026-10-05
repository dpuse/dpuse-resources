# chardet test files

Test files from [chardet](https://github.com/runk/node-chardet), a character encoding detection library for JavaScript. They are here to test and evaluate encoding detection and decoding.

## Source and licence

- **Source:** the [runk/node-chardet](https://github.com/runk/node-chardet) repository, `master` branch, as of October 2026.
- **Licence:** MIT, copyright 2024 Dmitry Shirokov. The full licence text is in [`LICENSE`](LICENSE), which must stay with these files.
- **Credit:** "Test files from chardet (<https://github.com/runk/node-chardet>), copyright 2024 Dmitry Shirokov, MIT licence."
- **Changes:** none to the files themselves. They keep chardet's names and folder layout. From the corpus, only the generated sample files are included, without chardet's corpus metadata (`index.json`, `ngrams.mjs`) or its source texts.

## What is here

- `encodings/` — chardet's [unit-test files](https://github.com/runk/node-chardet/tree/master/src/test/data/encodings), 44 files. Each is named after its encoding and, for some, its language, e.g. `windows_1251` or `iso88592_cs`. The `lang_*` files are UTF-8 text in different languages.
- `corpus/` — chardet's [generated corpus](https://github.com/runk/node-chardet/tree/master/corpus/generated), 172 files, arranged as `corpus/<encoding>/<language>/<use>/<document>.bin`:
    - `<encoding>` and `<language>` name the file's encoding and language, e.g. `windows-1251/ru`.
    - `<use>` is how chardet uses the file: `train` to build its detection models, `validation` to tune them, and `test` for the final check.
    - Most files are short synthetic texts written for chardet, encoded in that folder's encoding. Some are copies of the unit-test files.

## Usage

Preview any file to see which encoding is detected, and compare it with the encoding its name or folder gives. Some encodings here can be detected but not decoded by browsers, such as the DOS code pages `CP850`, `CP852` and `IBM855`. `ISO-2022-CN` can be neither detected nor decoded.

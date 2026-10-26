# chardet test files

Test files from [chardet](https://github.com/runk/node-chardet), a character encoding detection library for JavaScript. They are here to test and evaluate encoding detection and decoding.

## Source and licence

- **Source:** the [runk/node-chardet](https://github.com/runk/node-chardet) repository, `master` branch, as of October 2026.
- **Licence:** MIT, copyright 2024 Dmitry Shirokov. The full licence text is in [`LICENSE`](LICENSE), which must stay with these files.
- **Credit:** "Test files from chardet (<https://github.com/runk/node-chardet>), copyright 2024 Dmitry Shirokov, MIT licence."
- **Changes:** the contents of the files are unchanged. They are renamed and gathered into one folder, described below, with each encoding named as DPUse reports it, in lower case, rather than as chardet spells it. They come from chardet's [unit-test files](https://github.com/runk/node-chardet/tree/master/src/test/data/encodings) and its [generated corpus](https://github.com/runk/node-chardet/tree/master/corpus/generated). Files that appeared in both are kept once. `iso88598` is left out because it is `iso88598_he` without its final line break.

## What is here

181 text files, each stored in the encoding its name starts with, named `<encoding>_<language>[-<text>].txt`:

- `<encoding>` is the encoding, named as DPUse reports it, in lower case, e.g. `windows-1251` or `shift_jis`. `iso-2022-cn` keeps chardet's name, in lower case, because DPUse cannot detect it.
- `<language>` is the language code of the text, e.g. `ru`.
- `<text>` names one of six short texts written for chardet: `city-morning`, `community-garden`, `library`, `market`, `river-trip` and `workshop`. A file with no `<text>`, e.g. `koi8-r_ru.txt`, is one of chardet's unit-test files.

## Usage

Preview any file to see which encoding is detected, and compare it with the encoding its name starts with. Some encodings here can be detected but not decoded by browsers, such as the DOS code pages `cp850`, `cp852` and `ibm855`. `iso-2022-cn` can be neither detected nor decoded.

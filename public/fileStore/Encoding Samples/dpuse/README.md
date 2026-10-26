# DPUse encoding samples

Test files made by DPUse for character encoding detection and decoding: one or two for each encoding [jschardet](https://github.com/aadsm/jschardet) can detect. They are a copy of the samples in [dpuse-shared](https://github.com/dpuse/dpuse-shared/tree/main/tests/fixtures/encodings), renamed by encoding.

## What is here

93 files in 86 encodings, named `<encoding>_<file>`:

- `<encoding>` is the encoding the file is stored in, named as jschardet reports it, in lower case, e.g. `windows-1251` or `cp850`.
- `<language>.txt` holds about 1,000 characters of the Universal Declaration of Human Rights in a language that suits the encoding, named by its language code, e.g. `windows-1251_ru.txt`.
- `names.csv` holds a small table of names and cities, mostly plain ASCII with a few accented or non-Latin values. It is in seven encodings.

Each file keeps only characters its encoding can hold. `cp1006_ur.txt` (Urdu) loses about 17% of the text, because that code page lacks several Urdu letters. `cp864_ar.txt` and `cp1006_ur.txt` store Arabic letters as fixed presentation forms, as those code pages require.

## Source and licence

- **Universal Declaration of Human Rights:** excerpts from NLTK's "Universal Declaration of Human Rights Corpus (Unicode Version)" ([udhr2.zip](https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/udhr2.zip)), re-encoded into each encoding. The text is in the public domain, as recorded in [NLTK's data index](https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/index.xml) (the `udhr2` entry), so these files need no licence.
- **Written for these tests:** the `<encoding>_names.csv` files, and two Welsh sentences added to `iso8859-14_cy.txt`. They are under DPUse's licence.

## Usage

Preview any file to see which encoding is detected, and compare it with the encoding its name starts with. The [dpuse-shared results table](https://github.com/dpuse/dpuse-shared/tree/main/tests/fixtures/encodings#results-with-jschardet-400) lists what jschardet detects for each file, under the file's original name `<encoding>.txt` or `<encoding>.csv`.

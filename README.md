# DPUse Resources

A collection of DPUse resources.

TODO: Upload the application and fileStore indexes to the respective plugins. Change plugins to retrieve indexes from uploaded file and removed embedded versions.

## The 'fileStore' Folder

...

## The 'fileStoreIndex.json' File

...

## The '\_headers' File

...

## The 'singlePixel.png' File

...

## Encoding Samples

The [Encoding Samples](./public/fileStore/Encoding%20Samples) folder holds test files for character encoding detection and decoding.

- **The folder itself:**
    - a copy of `dpuse-shared`'s encoding sample files, one per encoding jschardet can detect plus a few mostly-ASCII CSV files
    - mostly public-domain UDHR text, plus data written for these tests
    - see the [dpuse-shared README](https://github.com/dpuse/dpuse-shared#test-data) for sources and changes
- **[chardet](./public/fileStore/Encoding%20Samples/chardet):** test files from [chardet](https://github.com/runk/node-chardet), copyright 2024 Dmitry Shirokov, MIT licence, unchanged. The folder's `LICENSE` file holds the licence, and its `README.md` gives the source, credit and layout.
    - `encodings`: chardet's [unit-test files](https://github.com/runk/node-chardet/tree/master/src/test/data/encodings), each named after its encoding and, for some, its language.
    - `corpus`: chardet's [generated corpus](https://github.com/runk/node-chardet/tree/master/corpus/generated), short synthetic texts arranged by encoding, language and use (`train`, `validation` and `test`).

## Interesting Data Sources

Data sets worth knowing about that we do not host here, with their licensing terms. If you want to use one, download your own copy from its source, so you get the latest data and accept its terms yourself.

### Formula 1 (Jolpica F1)

Formula 1 race data from 1950 onwards: seasons, rounds, circuits, drivers, teams, results, laps, pit stops, penalties and championship standings.

- **Source:** [Jolpica F1](https://github.com/jolpica/jolpica-f1), the open-source successor to the Ergast F1 API. Its data is available through the API and as [CSV database dumps](https://github.com/jolpica/jolpica-f1/discussions/261), downloaded from [api.jolpi.ca/data/dumps/download/](https://api.jolpi.ca/data/dumps/download/). The tables are described in its [database documentation](https://dbdocs.io/jolpica/jolpica-f1).
- **Licence:** the data is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/), as set out in Jolpica's [Terms of Use](https://github.com/jolpica/jolpica-f1/blob/main/TERMS.md). The project's code is under a separate licence, Apache-2.0, which does not cover the data.
    - **Non-commercial use only:** the free dumps may be used for non-commercial purposes, and become available 14 days after release.
    - **Commercial use:** needs Jolpica's supporter tier, or permission from admin@jolpi.ca.
    - **Attribution:** credit Jolpica F1 and name the licence.
    - **Share-alike:** anything built from the data must be shared under the same licence.

### World Development Indicators (World Bank)

The World Bank's main collection of development data: economic, social and environmental indicators for every country and region, compiled from officially recognised international sources. WDI stands for World Development Indicators.

- **Source:** the [World Bank Data Catalog](https://datacatalog.worldbank.org/search/dataset/0037712/world-development-indicators), as the bulk "CSV file" download, a ZIP archive. In October 2026 it was about 270 MB and updated on 2 October 2026. More about the collection: [wdi.worldbank.org](http://wdi.worldbank.org/) and [Wikipedia](https://en.wikipedia.org/wiki/World_Development_Indicators).
- **Licence:** [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/), as stated on the data catalog page. Commercial use and redistribution are allowed, provided you credit the source, e.g. "Source: World Bank, World Development Indicators", and name the licence.
- **Our copy:** `WDICSV.csv`, the data file from the bulk download of 1 October 2026, unchanged, in the [World Bank](./public/fileStore/World%20Bank) folder. Its `README.md` gives the source, credit, licence and file details.
    - **Size:** 198,481,686 bytes (198 MB), too large for the release upload. It is uploaded by hand, and `scripts/buildIndexes_.json` lists it so the index builder includes it.
    - **Rows and columns:** 396,970 rows (265 countries and regions × 1,498 indicators) and 70 columns: `Country Name`, `Country Code`, `Indicator Name`, `Indicator Code`, then one per year from `1960` to `2025`.
    - **Format:** UTF-8 with a byte-order mark, Windows line endings, quoted values with commas, plain decimal numbers, and 65.6% of year cells empty.
- **Earlier copy:** a 2016 release, `WDI_Data.csv` (164 MB, 1960–2014, plain ASCII, numbers in scientific notation), was used before. The data file has since been renamed `WDICSV.csv`.
- **Usage:** a good stress test for reading large delimited files: streaming and chunking, a byte-order mark, quoted values with commas, mostly empty columns and wide rows. For real analysis, download the current release, as the data is updated regularly.

<!-- OPENING_START -->

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/dpuse/dpuse-resources/actions/workflows/ci.yml/badge.svg)](https://github.com/dpuse/dpuse-resources/actions/workflows/ci.yml)

Sample data files.

[Report a Vulnerability](https://github.com/dpuse/dpuse-resources/security/advisories/new) · [Open an Issue](https://github.com/dpuse/dpuse-resources/issues)

## About DPUse

[DPUse](https://www.dpuse.app) (Data Positioning & Use) is an in-browser application that positions your data for use through three core activities: sourcing, contextualising, and publishing.

**Sourcing** uses a library of [Connectors](https://www.dpuse.app/connectors) to establish [Connections](https://www.dpuse.app) to applications, databases, file stores, and curated datasets; these connections are subsequently used to configure structured [Data Views](https://www.dpuse.app) from the underlying sources.

**Contextualising** extracts chronological events from those [Data Views](https://www.dpuse.app) and maps them into comprehensive [Context Models](https://www.dpuse.app). This gives the DPUse Engine the structural framework needed to generate deterministic transactions, facts, or observations.

**Publishing** uses a library of [Presenters](https://www.dpuse.app) to render standard [Presentations](https://www.dpuse.app) immediately using the contextualised data; additionally, [Cookbooks](https://www.dpuse.app) of [Recipes](https://www.dpuse.app) let you build Data Apps using your preferred tools.

In addition, DPUse provides [Tools](https://www.dpuse.app) used by the application, and you can use them to construct connectors and presenters.

<!-- OPENING_END -->

<!-- USAGE_START -->

## Usage

You may view or clone this repository for your own purposes.

```bash
git clone https://github.com/dpuse/dpuse-resources.git
cd dpuse-resources
npm install
```

_Requires [Node.js](https://nodejs.org/) 24 or later, [npm](https://www.npmjs.com/) 12 or later, and [TypeScript](https://www.typescriptlang.org/) 6.0.3 or later._

This repository is managed using the common set of actions provided by [@dpuse/dpuse-development](https://github.com/dpuse/dpuse-development). See the `scripts` block in [package.json](https://github.com/dpuse/dpuse-resources/blob/main/package.json) for details.

<!-- USAGE_END -->

<!-- DEPENDENCY_LICENSES_START -->

## Dependency Licenses

License data is updated each time `npm run document` is run, using [license-checker](https://github.com/RSeidelsohn/license-checker-rseidelsohn). The following table lists all production dependencies. This project has no build record, so the list is taken from its declared dependencies. These dependencies have been checked and confirmed to use MIT, all of which allow commercial use. All are used unmodified, so any licence conditions that apply only to modified versions are not triggered. Developers cloning this repository should independently verify development dependencies.

| Dependency | Version | License(s) | Document |
| :--------- | :-----: | :--------- | :------- |

### Dependency Tree

The dependency tree below lists every package in this project — direct and transitive — along with its installed version, release date, and update status. Packages flagged ❗ have a newer version available; ⚠️ indicates a package that hasn't been updated in the last 6 months or longer. Neither flag necessarily indicates a problem: we let new releases stabilise before upgrading, and some packages are mature and stable (have limited or no dependencies), so they require no active development.

<!-- DEPENDENCY_LICENSES_END -->

<!-- BUNDLE_START -->

<!-- BUNDLE_END -->

<!-- QUALITY_SECURITY_START -->

## Quality & Security

This section is updated each time `npm run document` is run. Settings come from the repository's workflow files and GitHub. Test coverage and the Fallow score are measured at the same time.

### Testing

| Check                | Status | What it does                                                                                                                                                                             |
| :------------------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests           | ✅ On  | [Vitest](https://vitest.dev) runs the unit tests. Part of the [CI workflow](https://github.com/dpuse/dpuse-resources/actions/workflows/ci.yml) on every push and pull request to `main`. |
| Property-based tests | ❌ Off | [fast-check](https://fast-check.dev) runs many random inputs per test to find edge cases, alongside the unit tests.                                                                      |

### Code Quality

| Check         | Status | What it does                                                                                                                                                                                                       |
| :------------ | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code analysis | ❌ Off | [SonarCloud](https://sonarcloud.io) checks every push for bugs, code smells and vulnerabilities.                                                                                                                   |
| Linting       | ✅ On  | [ESLint](https://eslint.org) checks the code for errors and style problems. Part of the [CI workflow](https://github.com/dpuse/dpuse-resources/actions/workflows/ci.yml) on every push and pull request to `main`. |

### Security Analysis

| Check           | Status | What it does                                                                                                                                                                                                                                                                                                                                                             |
| :-------------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Push protection | ✅ On  | [GitHub push protection](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations) blocks pushes that contain credentials.                                                                                                                                                                                            |
| Static analysis | ✅ On  | [![CodeQL](https://github.com/dpuse/dpuse-resources/actions/workflows/codeql.yml/badge.svg)](https://github.com/dpuse/dpuse-resources/security/code-scanning) [CodeQL](https://codeql.github.com) scans GitHub Actions and JavaScript/TypeScript for security vulnerabilities, using the extended security queries, on every push and pull request to `main` and weekly. |
| Secret scanning | ✅ On  | [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning) detects credentials, such as API keys and tokens, committed to the repository.                                                                                                                                                                                                        |

### Dependencies

| Check               | Status | What it does                                                                                                                                                                                                                                                                                                           |
| :------------------ | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vulnerability audit | ✅ On  | [npm audit](https://docs.npmjs.com/cli/commands/npm-audit) fails when a shipped dependency has any known vulnerability, or a development dependency has a high or critical one. Part of the [CI workflow](https://github.com/dpuse/dpuse-resources/actions/workflows/ci.yml) on every push and pull request to `main`. |
| Supply chain risk   | ✅ On  | [Socket](https://socket.dev) flags malicious packages, typosquatting and suspicious behaviour that may not yet have a CVE.                                                                                                                                                                                             |
| Security alerts     | ✅ On  | [Dependabot](https://docs.github.com/en/code-security/dependabot) alerts when a dependency has a known vulnerability, using the GitHub Advisory Database.                                                                                                                                                              |
| Security updates    | ❌ Off | [Dependabot](https://docs.github.com/en/code-security/dependabot) opens pull requests that update vulnerable dependencies. These are handled manually.                                                                                                                                                                 |
| Version updates     | ❌ Off | [Dependabot](https://docs.github.com/en/code-security/dependabot) opens pull requests for new dependency versions. These are handled manually.                                                                                                                                                                         |

### OpenSSF 🚧

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/dpuse/dpuse-resources/badge)](https://scorecard.dev/viewer/?uri=github.com/dpuse/dpuse-resources)

This project is working towards the [OpenSSF Best Practices](https://www.bestpractices.dev) Passing badge, a self-certification covering security policy, vulnerability reporting, build processes, code quality, and more. Currently the [OpenSSF Scorecard](https://scorecard.dev) provides an independent automated assessment of the project's security practices and is an ongoing area of improvement.

### Reporting Vulnerabilities

Please do not open public GitHub issues for security vulnerabilities. See [SECURITY.md](./SECURITY.md) for how to report one privately, the full disclosure policy, and expected response times.

<!-- QUALITY_SECURITY_END -->

<!-- CONTRIBUTING_LICENSE_START -->

## Contributing

This repository is maintained solely by its owner and does not, at present, accept external contributions into the canonical repo. Its source is published openly under the MIT License — every DPUse project is fully open source except DPUse Engine, which remains closed and proprietary.

For security vulnerabilities, see [Reporting Vulnerabilities](#reporting-vulnerabilities). For bugs, inconsistencies, or other feedback, [open a GitHub issue](https://github.com/dpuse/dpuse-resources/issues) — feedback is read, but responses and fixes are at the maintainer's discretion.

## License

This project is licensed under the MIT License, permitting free use, modification, and distribution.

[MIT](./LICENSE) © 2026 Jonathan Terrell

<!-- CONTRIBUTING_LICENSE_END -->

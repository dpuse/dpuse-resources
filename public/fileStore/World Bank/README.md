# World Bank

Data from the World Bank's World Development Indicators (WDI): economic, social and environmental indicators for every country and region, compiled from officially recognised international sources.

## Source and licence

- **Source:** World Bank, World Development Indicators, from the bulk "CSV file" download on the [World Bank Data Catalog](https://datacatalog.worldbank.org/search/dataset/0037712/world-development-indicators).
- **Licence:** [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You may use, share and adapt the data, including commercially, provided you credit the source and name the licence.
- **Credit:** "Source: World Bank, World Development Indicators. Licensed under CC BY 4.0."
- **Changes:** none. `WDICSV.csv` is an unchanged copy of the data file from the bulk download of 1 October 2026.

## WDICSV.csv

The main data file of the World Development Indicators. It is too large for the release upload, so it is uploaded by hand and listed in the file store index from `scripts/buildIndexes_.json`.

- **Rows:** 396,970 data rows plus a header, one per country or region and indicator: 265 countries and regions × 1,498 indicators.
- **Columns:** 70 — `Country Name`, `Country Code`, `Indicator Name`, `Indicator Code`, then one column per year from `1960` to `2025`.
- **Size:** 198,481,686 bytes (198 MB).
- **Format:** UTF-8 with a byte-order mark, Windows line endings (CRLF), comma-separated, with quotes around values that contain commas, e.g. `"Access to clean fuels and technologies for cooking, rural (% of rural population)"`. Nearly all text is ASCII; a few indicator names use an en dash (`–`) or a non-breaking space.
- **Values:** plain decimal numbers, e.g. `11.494704278406504`. 65.6% of the year cells are empty, because many indicators have no data for many years.

The bulk download also holds metadata files that are not uploaded here: `WDICountry.csv` and `WDISeries.csv` describe the countries and indicators, and `WDIcountry-series.csv`, `WDIfootnote.csv` and `WDIseries-time.csv` hold notes on particular values.

## Usage

The file is here as a large, realistic test of reading delimited files: streaming and chunking, a byte-order mark, quoted values with commas, mostly empty columns and wide rows.

For real analysis, download the current release from the World Bank Data Catalog, as the data is updated regularly.

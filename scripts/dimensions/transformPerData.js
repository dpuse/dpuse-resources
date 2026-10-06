import fs from 'node:fs/promises';
import { tabToJson } from './utilities.js';

// Reads and writes its own 'data' folder, wherever it is run from.
process.chdir(import.meta.dirname);

async function transformLanguageData() {
    const languages = [];

    const geoNamesLanguageData = await fs.readFile('./data/downloads/geoNamesLanguages.tsv', 'utf-8');
    const geoNamesLanguages = tabToJson(geoNamesLanguageData); // TODO: Do this as part of retrieval?

    for (const rec of geoNamesLanguages) {
        if (!rec['ISO 639-3']) {
            console.log('! Ignored blank ISO 639-3 code', `for ISO 639-2 code '${rec['ISO 639-2']}', name '${rec['Language Name']}'.`);
            continue;
        }

        const bibliographicCode = unpackBibliographicCode(rec['ISO 639-2']);
        if (bibliographicCode === undefined) {
            languages.push({
                id: rec['ISO 639-3'], // Terminological code.
                idB: rec['ISO 639-2'] || undefined, // Bibliographic code.
                id2: rec['ISO 639-1'] || undefined,
                label: { en: rec['Language Name'] }
            });
        } else {
            console.log(
                '! Unpacked ISO 639-2 code for ISO 639-3 code',
                `'${rec['ISO 639-3']}', from '${rec['ISO 639-2']}' to '${bibliographicCode}', name '${rec['Language Name']}'.`
            );
            languages.push({
                id: rec['ISO 639-3'], // Terminological code.
                idB: bibliographicCode, // Bibliographic code.
                id2: rec['ISO 639-1'] || undefined,
                label: { en: rec['Language Name'] }
            });
        }
    }

    await fs.writeFile('./data/perLanguages.json', JSON.stringify(languages, null, 4), 'utf-8');

    console.log('∑ Language count (ISO 639-3):', languages.length);
    console.log('∑ Language count (ISO 639-2):', languages.filter((l) => !!l.idB).length);
    console.log('∑ Language count (ISO 639-1):', languages.filter((l) => !!l.id2).length);
}

// GeoNames lists some ISO 639-2 codes as a pair, e.g. 'fre / fra*'. The bibliographic code is the one between the '/'
// and the '*'. Undefined for a code that is not a pair.
function unpackBibliographicCode(code) {
    const slashIndex = code.indexOf('/');
    const starIndex = code.indexOf('*', slashIndex);
    if (starIndex === -1 || slashIndex <= 0) return;
    const firstCode = code.slice(0, slashIndex).trim();
    const secondCode = code.slice(slashIndex + 1, starIndex).trim();
    return firstCode && secondCode ? secondCode : undefined;
}

// TODO: This step fails: it reads 'countriesFromRestCountriesIndependent.json' and
// 'countriesFromRestCountriesDependent.json' from './data/retrievals', but 'retrieveGeoData.js' never writes those
// files. It fetches the independent and dependent countries separately, then writes them combined and sorted as
// 'countriesFromRestCountries.json', which 'transformGeoData.js' and 'transformFinData.js' read. Either read that
// combined file here, as the other transforms do (simplest, and the result is the same, since only the countries'
// 'cca2' and 'demonyms' are used), or have 'retrieveGeoData.js' also write the two separate files. Noted in October
// 2026; the language step above still runs, and rebuilt 'perLanguages.json' byte for byte.
async function transformNationalityData() {
    const countryDataRestCountriesIndependent = await fs.readFile('./data/retrievals/countriesFromRestCountriesIndependent.json', 'utf-8');
    const countriesRestCountriesIndependent = JSON.parse(countryDataRestCountriesIndependent);
    const countryDataRestCountriesDependent = await fs.readFile('./data/retrievals/countriesFromRestCountriesDependent.json', 'utf-8');
    const countriesRestCountriesDependent = JSON.parse(countryDataRestCountriesDependent);
    const countries = [...countriesRestCountriesIndependent, ...countriesRestCountriesDependent];

    const nationalityMap = {};
    for (const country of countries) {
        for (const value of Object.values(country.demonyms.eng)) {
            if (value) nationalityMap[country.cca2] = { name: value };
        }
    }
    const nationalities = [];
    for (const [key, value] of Object.entries(nationalityMap)) {
        nationalities.push({ id: key.toLocaleLowerCase(), label: { en: value.name } });
    }
    await fs.writeFile('./data/perNationalities.json', JSON.stringify(nationalities, null, 4), 'utf-8');

    console.log('∑ Nationality count:', nationalities.length);
}

console.log('# Transforming Language Data...');
await transformLanguageData();

console.log('\n# Transforming Nationality Data...');
await transformNationalityData();

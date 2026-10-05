import fs from 'node:fs/promises';

// Reads and writes its own 'data' folder, wherever it is run from.
process.chdir(import.meta.dirname);

async function transformCurrencies() {
    const countriesFromRestCountriesData = await fs.readFile('./data/retrievals/countriesFromRestCountries.json', 'utf-8');
    const countriesFromRestCountries = JSON.parse(countriesFromRestCountriesData);

    const currencyMap = new Map();
    for (const country of countriesFromRestCountries) {
        const countryCurrencies = Object.entries(country.currencies ?? {});
        if (countryCurrencies.length > 1) console.log('! Multiple currencies for', `'${country.name.common}'.`);

        for (const [key, value] of countryCurrencies) {
            const currency = currencyMap.get(key);
            if (currency === undefined) {
                currencyMap.set(key, { c: 1, country: country.name.common, value });
            } else {
                reportCurrencyDifferences(key, currency, country.name.common, value);
                currency.c += 1;
            }
        }
    }

    const sortedCurrencyEntries = [...currencyMap].toSorted(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
    const currencies = sortedCurrencyEntries.map(([key, currency]) => ({ id: key.toLocaleLowerCase(), name: currency.value.name, symbol: currency.value.symbol }));
    await fs.writeFile('./data/finCurrencies.json', JSON.stringify(currencies, null, 4), 'utf-8');

    console.log('∑ Currency count:', currencies.length);
}

// Logs where two countries give the same currency a different symbol or name.
function reportCurrencyDifferences(key, currency, countryName, value) {
    if (currency.value.symbol !== value.symbol) {
        console.log('! Different currency symbol for', `${key}, existing: '${currency.country}' - '${currency.value.symbol}'; new: '${countryName}' - '${value.symbol}'.`);
    }
    if (currency.value.name !== value.name) {
        console.log('! Different currency name for', `${key}, existing: '${currency.country}' - '${currency.value.name}'; new: '${countryName}' - '${value.name}'.`);
    }
}

console.log('# Transforming Currency Data...');
await transformCurrencies();

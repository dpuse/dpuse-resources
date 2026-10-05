import fs from 'node:fs/promises';

// Reads GEO_NAMES_USERNAME from a '.env' file in the folder the script is run from, then moves into its own folder,
// whose 'data' folder it writes to.
process.loadEnvFile();
process.chdir(import.meta.dirname);

async function retrieveGeoNamesData() {
    // Country postal code information data. GeoNames serves its API over HTTPS from 'secure.geonames.org'.
    const geoNamesUsername = process.env.GEO_NAMES_USERNAME;
    const geoNamesPostalCodeCountryInfoResponse = await fetch(`https://secure.geonames.org/postalCodeCountryInfoJSON?username=${geoNamesUsername}`);
    const geoNamesPostalCodeCountryInfos = await geoNamesPostalCodeCountryInfoResponse.json();
    geoNamesPostalCodeCountryInfos.geonames.sort((left, right) => left.countryCode.localeCompare(right.countryCode));
    await fs.writeFile('./data/retrievals/countriesFromGeoNamesPostalCodeCountryInfo.json', JSON.stringify(geoNamesPostalCodeCountryInfos.geonames), 'utf-8');

    // Counts.
    console.log('Country count (GeoNames Postal Code Info)_:', geoNamesPostalCodeCountryInfos.geonames.length);
}

async function retrieveRestCountriesData() {
    // Independent country data.
    const restCountriesIndependentResponse = await fetch('https://restcountries.com/v3.1/independent?status=true');
    const restCountriesIndependents = await restCountriesIndependentResponse.json();

    // Dependent country data.
    const restCountriesDependentResponse = await fetch('https://restcountries.com/v3.1/independent?status=false');
    const restCountriesDependents = await restCountriesDependentResponse.json();

    // Combined data.
    const restCountries = [...restCountriesIndependents, ...restCountriesDependents];
    restCountries.sort((left, right) => left.cca2.localeCompare(right.cca2));
    await fs.writeFile('./data/retrievals/countriesFromRestCountries.json', JSON.stringify(restCountries), 'utf-8');

    // Counts.
    console.log('Country count (Rest Countries Independent):', restCountriesIndependents.length);
    console.log('Country count (Rest Countries Dependent)__:', restCountriesDependents.length);
    console.log('Country count (Rest Countries Combined)___:', restCountries.length);
}

await fs.mkdir('./data/retrievals', { recursive: true });

console.log(`# Retrieving GeoNames Data...`);
await retrieveGeoNamesData();

console.log(`\n# Retrieving Rest Countries Data...`);
await retrieveRestCountriesData();

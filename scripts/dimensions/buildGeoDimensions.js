import fs from 'node:fs/promises';
import JSZip from 'jszip';
import kdTreeModule from 'kd-tree-javascript';

// Reads and writes its own 'data' folder, wherever it is run from.
process.chdir(import.meta.dirname);

const kdTree = kdTreeModule.kdTree;

async function buildGeographicalDimensions() {
    const timeZoneNames = Intl.supportedValuesOf('timeZone');
    const timeZones = [];
    for (const timeZoneName of timeZoneNames) {
        const utcOffset = getUTCOffset(timeZoneName);
        timeZones.push({ utcOffset, name: timeZoneName });
    }
    timeZones.sort((a, b) => {
        const offsetA = utcOffsetToMinutes(a.utcOffset);
        const offsetB = utcOffsetToMinutes(b.utcOffset);
        return offsetA === offsetB ? a.name.localeCompare(b.name) : offsetA - offsetB;
    });
    fs.writeFile('./data/retrievals/timeZones.json', JSON.stringify(timeZones, null, 4), 'utf-8');
}

// Formats a time zone's current offset as 'UTC±HH:MM', from the short offset 'Intl' gives, e.g. 'GMT+5:30' or 'GMT'.
function getUTCOffset(timeZone) {
    const now = new Date();
    const options = { timeZone, timeZoneName: 'shortOffset' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    const offset = (parts.find((p) => p.type === 'timeZoneName')?.value || 'UTC').replace('GMT', 'UTC');
    if (offset === 'UTC') return 'UTC+00:00';
    const sign = offset.charAt(3);
    if (sign !== '+' && sign !== '-') return offset;
    const [hours = '', minutes = '00'] = offset.slice(4).split(':', 2);
    return `UTC${sign}${hours.padStart(2, '0')}:${minutes}`;
}

function utcOffsetToMinutes(offset) {
    const match = offset.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = Number(match[2]);
    const minutes = Number(match[3]);
    return sign * (hours * 60 + minutes);
}

// Great-circle distance in kilometres between two points, for the nearest-place lookup.
function calculateDistance(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const aCalc = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
}

class GeoNamesProcessor {
    constructor() {
        this.places = new Map();
        this.hierarchy = new Map();
        this.postalCodes = new Map();
        this.kdTree = null; // KD-Tree for nearest-place lookup
    }

    async downloadAndExtract(urlName, url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to download ${url}`);

        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        const txtFile = Object.keys(zip.files).find((name) => name === `${urlName}.txt`);
        return await zip.file(txtFile).async('string');
    }

    parsePlacesData(text) {
        const lines = text.split('\n');
        let count = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const fields = line.split('\t');
            if (fields.length < 19) continue;

            const place = {
                geonameId: Number(fields[0]),
                name: fields[1],
                latitude: Number(fields[4]),
                longitude: Number(fields[5]),
                featureClass: fields[6],
                featureCode: fields[7],
                countryCode: fields[8],
                admin1Code: fields[10],
                admin2Code: fields[11],
                population: Number(fields[14]) || 0
            };

            this.places.set(place.geonameId, place);
            count++;
        }

        return count;
    }

    parseHierarchyData(text) {
        const lines = text.split('\n');
        let count = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const fields = line.split('\t');
            if (fields.length < 2) continue;

            const parentId = Number(fields[0]);
            const childId = Number(fields[1]);

            this.hierarchy.set(childId, parentId);
            count++;
        }

        return count;
    }

    // ===== KD-Tree Build =====
    buildKdTree() {
        const points = Array.from(this.places.values(), (p) => ({
            lat: p.latitude,
            lng: p.longitude,
            geonameId: p.geonameId,
            name: p.name
        }));

        this.kdTree = new kdTree(points, calculateDistance, ['lat', 'lng']);
    }

    parsePostalData(text) {
        if (!this.kdTree) this.buildKdTree();

        const lines = text.split('\n');
        let count = 0;
        console.log(1111, lines.length);

        for (const line of lines) {
            if (!line.trim()) continue;

            const fields = line.split('\t');
            if (fields.length < 12) continue;

            const postal = {
                countryCode: fields[0],
                postalCode: fields[1],
                placeName: fields[2],
                admin1Name: fields[3],
                admin1Code: fields[4],
                admin2Name: fields[5],
                admin2Code: fields[6],
                latitude: Number(fields[9]),
                longitude: Number(fields[10])
            };

            // ===== KD-Tree nearest place lookup =====
            const nearest = this.kdTree.nearest({ lat: postal.latitude, lng: postal.longitude }, 1);
            postal.geonameId = nearest.length > 0 ? nearest[0][0].geonameId : null;

            this.postalCodes.set(postal.postalCode, postal);
            count++;
        }

        console.log(3333, count);
        return count;
    }

    getHierarchy(postalCode) {
        const postal = this.postalCodes.get(postalCode);
        if (!postal) return null;

        const result = {
            postalCode: postal.postalCode,
            placeName: postal.placeName,
            city: null,
            state: postal.admin1Name,
            stateCode: postal.admin1Code,
            country: postal.countryCode
        };

        if (postal.geonameId) {
            const city = this.findParentCity(postal.geonameId);
            if (city) {
                result.city = city.name;
                result.cityPopulation = city.population;
            }
        }

        if (!result.city) {
            result.city = postal.placeName;
        }

        return result;
    }

    findParentCity(geonameId) {
        let currentId = geonameId;
        const visited = new Set();

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const place = this.places.get(currentId);

            if (place && place.featureClass === 'P' && ['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC'].includes(place.featureCode)) {
                return place;
            }

            currentId = this.hierarchy.get(currentId);
        }

        return null;
    }
}

// ===== Usage function =====
async function buildLocationDimension(countryCode = 'US') {
    const processor = new GeoNamesProcessor();

    console.log('Loading places data...');
    const placesText = await processor.downloadAndExtract(countryCode, `https://download.geonames.org/export/dump/${countryCode}.zip`);
    const placesCount = processor.parsePlacesData(placesText);
    console.log(`Loaded ${placesCount} places`);

    console.log('Loading hierarchy data...');
    const hierarchyText = await processor.downloadAndExtract('hierarchy', 'https://download.geonames.org/export/dump/hierarchy.zip');
    const hierarchyCount = processor.parseHierarchyData(hierarchyText);
    console.log(`Loaded ${hierarchyCount} hierarchy relationships`);

    console.log('Loading postal codes...');
    const postalText = await processor.downloadAndExtract(countryCode, `https://download.geonames.org/export/zip/${countryCode}.zip`);
    console.log('Parsing postal codes...');
    const postalCount = processor.parsePostalData(postalText);
    console.log(`Loaded ${postalCount} postal codes`);

    return processor;
}

// TODO: Turn this script from a trial into a real build. Noted in October 2026:
// - It ends with a test call below: it loads Australia ('AU') and logs the hierarchy for one postcode, '4020', but
//   writes nothing. A real build would take the country codes to process (from the command line, or every country in
//   'data/geoCountries.json') and write the location dimension into './data'.
// - 'parsePostalData' logs leftover debug output ('console.log(1111, …)' and 'console.log(3333, …)').
// - 'postalCodes' is keyed by postcode alone, so where several places share a postcode (common in Australia) only the
//   last one read is kept. Key by postcode and place name, or keep a list per postcode.
// - 'buildGeographicalDimensions' at the top (time zones and their UTC offsets) is never called. It also does not
//   await its 'fs.writeFile', and './data/retrievals' must exist first ('retrieveGeoData.js' creates it).
// ===== Example usage =====
const processor = await buildLocationDimension('AU');
const result = processor.getHierarchy('4020');
console.log('RESULT', result);

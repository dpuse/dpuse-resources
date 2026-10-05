// External Dependencies
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import type { Faker } from '@faker-js/faker';
import { faker as fakerEs } from '@faker-js/faker/locale/es';
import { faker as fakerEsMx } from '@faker-js/faker/locale/es_MX';
import { faker as fakerEnGb } from '@faker-js/faker/locale/en_GB';
import { faker as fakerEnUs } from '@faker-js/faker/locale/en_US';
import { faker as fakerEnIe } from '@faker-js/faker/locale/en_IE';
import { faker as fakerEnIn } from '@faker-js/faker/locale/en_IN';
import { faker as fakerEnAu } from '@faker-js/faker/locale/en_AU';
import { faker as fakerEnZa } from '@faker-js/faker/locale/en_ZA';
import { faker as fakerFr } from '@faker-js/faker/locale/fr';
import { faker as fakerDe } from '@faker-js/faker/locale/de';
import { faker as fakerIt } from '@faker-js/faker/locale/it';
import { faker as fakerPtPt } from '@faker-js/faker/locale/pt_PT';
import { faker as fakerPtBr } from '@faker-js/faker/locale/pt_BR';
import { faker as fakerNl } from '@faker-js/faker/locale/nl';
import { faker as fakerJa } from '@faker-js/faker/locale/ja';
import { faker as fakerAr } from '@faker-js/faker/locale/ar';
import { faker as fakerZhCn } from '@faker-js/faker/locale/zh_CN';

// Types ───────────────────────────────────────────────────────────────────────────────────────────────────────────────

type GenderId = 'female' | 'male';

type EthnicBackgroundId = 'black' | 'eastAsian' | 'hispanicLatino' | 'indigenous' | 'middleEastern' | 'mixed' | 'southAsian' | 'southeastAsian' | 'white';

interface Location {
    city: string;
    country: string;
    ethnicities: [number, EthnicBackgroundId][];
    id: string;
    locales: [number, string][];
    sizeWeight: number;
}

interface MonthEntry {
    index: number;
    maxDay: number | undefined;
    month: number;
    year: number;
}

interface ActivePerson {
    ageAtHireYears: number;
    personId: string;
    hireMonthIndex: number;
    locationId: string;
}

interface EmploymentRow {
    personId: string;
    employerId: string;
    employmentId: string;
    hireDate: string;
    terminationDate: string;
}

// Constants ───────────────────────────────────────────────────────────────────────────────────────────────────────────

const START_YEAR = 2016;
const START_MONTH = 0; // January
const START_HEADCOUNT = 10;
const FINAL_TARGET = 17_500;
const ANNUAL_ATTRITION_RATE = 0.13;
const NOISE_STEP = 0.03;
const MAX_NOISE = 0.1;
const GROWTH_STEEPNESS = 6.5;
const GROWTH_INFLECTION = 0.58;
const EMPLOYER_ID = 'O001';

const APPLICATION_DIRECTORY = './public/application';
const WORKFORCE_DIRECTORY = './public/application/hr/workforce';
const ORGANISATIONS_FILE = './public/application/organisations.csv';

// Data ────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const localesByKey: Record<string, Faker> = {
    ar: fakerAr,
    de: fakerDe,
    en_AU: fakerEnAu,
    en_GB: fakerEnGb,
    en_IE: fakerEnIe,
    en_IN: fakerEnIn,
    en_US: fakerEnUs,
    en_ZA: fakerEnZa,
    es: fakerEs,
    es_MX: fakerEsMx,
    fr: fakerFr,
    it: fakerIt,
    ja: fakerJa,
    nl: fakerNl,
    pt_BR: fakerPtBr,
    pt_PT: fakerPtPt,
    zh_CN: fakerZhCn
};

const locations: Location[] = [
    {
        id: 'L01',
        city: 'Madrid',
        country: 'Spain',
        sizeWeight: 30,
        locales: [
            [9, 'es'],
            [1, 'en_GB']
        ],
        ethnicities: [
            [72, 'white'],
            [12, 'hispanicLatino'],
            [4, 'black'],
            [4, 'middleEastern'],
            [2, 'southAsian'],
            [2, 'eastAsian'],
            [2, 'mixed'],
            [1, 'southeastAsian'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L02',
        city: 'Barcelona',
        country: 'Spain',
        sizeWeight: 7,
        locales: [
            [9, 'es'],
            [1, 'fr']
        ],
        ethnicities: [
            [68, 'white'],
            [13, 'hispanicLatino'],
            [5, 'black'],
            [4, 'middleEastern'],
            [3, 'mixed'],
            [3, 'southAsian'],
            [2, 'eastAsian'],
            [1, 'southeastAsian'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L03',
        city: 'London',
        country: 'United Kingdom',
        sizeWeight: 9,
        locales: [
            [8, 'en_GB'],
            [1, 'en_IN'],
            [1, 'zh_CN']
        ],
        ethnicities: [
            [55, 'white'],
            [15, 'southAsian'],
            [10, 'black'],
            [6, 'eastAsian'],
            [6, 'mixed'],
            [5, 'middleEastern'],
            [1, 'hispanicLatino'],
            [1, 'southeastAsian'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L04',
        city: 'Paris',
        country: 'France',
        sizeWeight: 5,
        locales: [
            [8, 'fr'],
            [1, 'ar'],
            [1, 'en_GB']
        ],
        ethnicities: [
            [65, 'white'],
            [12, 'black'],
            [8, 'middleEastern'],
            [5, 'mixed'],
            [3, 'southAsian'],
            [3, 'eastAsian'],
            [2, 'southeastAsian'],
            [1, 'hispanicLatino'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L05',
        city: 'Berlin',
        country: 'Germany',
        sizeWeight: 5,
        locales: [
            [8, 'de'],
            [1, 'ar'],
            [1, 'en_GB']
        ],
        ethnicities: [
            [68, 'white'],
            [10, 'middleEastern'],
            [6, 'mixed'],
            [5, 'eastAsian'],
            [4, 'black'],
            [3, 'southAsian'],
            [2, 'southeastAsian'],
            [1, 'hispanicLatino'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L06',
        city: 'Milan',
        country: 'Italy',
        sizeWeight: 4,
        locales: [
            [85, 'it'],
            [15, 'en_GB']
        ],
        ethnicities: [
            [80, 'white'],
            [5, 'black'],
            [4, 'middleEastern'],
            [3, 'southAsian'],
            [3, 'mixed'],
            [2, 'eastAsian'],
            [1, 'hispanicLatino'],
            [1, 'southeastAsian'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L07',
        city: 'Lisbon',
        country: 'Portugal',
        sizeWeight: 3,
        locales: [
            [85, 'pt_PT'],
            [15, 'en_GB']
        ],
        ethnicities: [
            [70, 'white'],
            [10, 'black'],
            [8, 'mixed'],
            [5, 'hispanicLatino'],
            [3, 'southAsian'],
            [1, 'eastAsian'],
            [1, 'middleEastern'],
            [1, 'southeastAsian'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L08',
        city: 'Amsterdam',
        country: 'Netherlands',
        sizeWeight: 3,
        locales: [
            [8, 'nl'],
            [2, 'en_GB']
        ],
        ethnicities: [
            [65, 'white'],
            [8, 'black'],
            [6, 'southeastAsian'],
            [6, 'mixed'],
            [5, 'southAsian'],
            [5, 'middleEastern'],
            [3, 'eastAsian'],
            [1, 'hispanicLatino'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L09',
        city: 'Dublin',
        country: 'Ireland',
        sizeWeight: 2,
        locales: [[1, 'en_IE']],
        ethnicities: [
            [75, 'white'],
            [6, 'southAsian'],
            [5, 'black'],
            [5, 'eastAsian'],
            [5, 'mixed'],
            [2, 'middleEastern'],
            [1, 'hispanicLatino'],
            [1, 'southeastAsian']
        ]
    },
    {
        id: 'L10',
        city: 'New York',
        country: 'United States',
        sizeWeight: 8,
        locales: [
            [7, 'en_US'],
            [2, 'es_MX'],
            [1, 'zh_CN'],
            [1, 'en_IN']
        ],
        ethnicities: [
            [42, 'white'],
            [20, 'hispanicLatino'],
            [16, 'black'],
            [8, 'eastAsian'],
            [6, 'southAsian'],
            [3, 'mixed'],
            [2, 'middleEastern'],
            [2, 'southeastAsian'],
            [1, 'indigenous']
        ]
    },
    {
        id: 'L11',
        city: 'Mexico City',
        country: 'Mexico',
        sizeWeight: 6,
        locales: [
            [19, 'es_MX'],
            [1, 'en_US']
        ],
        ethnicities: [
            [75, 'hispanicLatino'],
            [12, 'indigenous'],
            [8, 'white'],
            [3, 'mixed'],
            [2, 'black']
        ]
    },
    {
        id: 'L12',
        city: 'São Paulo',
        country: 'Brazil',
        sizeWeight: 5,
        locales: [
            [19, 'pt_BR'],
            [1, 'en_US']
        ],
        ethnicities: [
            [45, 'white'],
            [20, 'mixed'],
            [12, 'black'],
            [10, 'hispanicLatino'],
            [5, 'indigenous'],
            [3, 'eastAsian'],
            [2, 'middleEastern'],
            [2, 'southeastAsian'],
            [1, 'southAsian']
        ]
    },
    {
        id: 'L13',
        city: 'Bogotá',
        country: 'Colombia',
        sizeWeight: 3,
        locales: [[1, 'es']],
        ethnicities: [
            [70, 'hispanicLatino'],
            [15, 'mixed'],
            [8, 'white'],
            [5, 'indigenous'],
            [2, 'black']
        ]
    },
    {
        id: 'L14',
        city: 'Buenos Aires',
        country: 'Argentina',
        sizeWeight: 2,
        locales: [[1, 'es']],
        ethnicities: [
            [55, 'white'],
            [30, 'hispanicLatino'],
            [8, 'mixed'],
            [4, 'indigenous'],
            [3, 'middleEastern']
        ]
    },
    {
        id: 'L15',
        city: 'Singapore',
        country: 'Singapore',
        sizeWeight: 5,
        locales: [
            [4, 'en_US'],
            [4, 'zh_CN'],
            [2, 'en_IN']
        ],
        ethnicities: [
            [55, 'eastAsian'],
            [20, 'southeastAsian'],
            [15, 'southAsian'],
            [6, 'white'],
            [3, 'mixed'],
            [1, 'middleEastern']
        ]
    },
    {
        id: 'L16',
        city: 'Tokyo',
        country: 'Japan',
        sizeWeight: 3,
        locales: [
            [92, 'ja'],
            [8, 'en_US']
        ],
        ethnicities: [
            [90, 'eastAsian'],
            [3, 'white'],
            [2, 'southeastAsian'],
            [2, 'southAsian'],
            [2, 'mixed'],
            [1, 'middleEastern']
        ]
    },
    {
        id: 'L17',
        city: 'Mumbai',
        country: 'India',
        sizeWeight: 4,
        locales: [
            [9, 'en_IN'],
            [1, 'en_US']
        ],
        ethnicities: [
            [90, 'southAsian'],
            [3, 'mixed'],
            [2, 'white'],
            [2, 'middleEastern'],
            [2, 'eastAsian'],
            [1, 'southeastAsian']
        ]
    },
    {
        id: 'L18',
        city: 'Sydney',
        country: 'Australia',
        sizeWeight: 2,
        locales: [
            [75, 'en_AU'],
            [15, 'zh_CN'],
            [10, 'en_IN']
        ],
        ethnicities: [
            [60, 'white'],
            [12, 'eastAsian'],
            [8, 'southAsian'],
            [6, 'mixed'],
            [5, 'southeastAsian'],
            [5, 'indigenous'],
            [4, 'middleEastern']
        ]
    },
    {
        id: 'L19',
        city: 'Dubai',
        country: 'United Arab Emirates',
        sizeWeight: 3,
        locales: [
            [35, 'ar'],
            [45, 'en_IN'],
            [20, 'en_US']
        ],
        ethnicities: [
            [45, 'southAsian'],
            [25, 'middleEastern'],
            [10, 'southeastAsian'],
            [10, 'white'],
            [5, 'eastAsian'],
            [3, 'black'],
            [2, 'mixed']
        ]
    },
    {
        id: 'L20',
        city: 'Johannesburg',
        country: 'South Africa',
        sizeWeight: 2,
        locales: [[1, 'en_ZA']],
        ethnicities: [
            [65, 'black'],
            [20, 'white'],
            [8, 'mixed'],
            [5, 'southAsian'],
            [2, 'eastAsian']
        ]
    }
];

for (const location of locations) {
    location.locales = normalizeWeights(location.locales);
    location.ethnicities = normalizeWeights(location.ethnicities);
}

const locationsById = new Map(locations.map((location) => [location.id, location]));
const locationsWeighted: [number, string][] = normalizeWeights(locations.map((location): [number, string] => [location.sizeWeight, location.id]));

// Processing ──────────────────────────────────────────────────────────────────────────────────────────────────────────

await generateGlobalWorkforce();

// Helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

async function generateGlobalWorkforce(): Promise<void> {
    try {
        console.info('🚀 Generating global workforce sample data...');

        const now = new Date();
        const months = buildMonthEntries(now);
        const totalMonthIndex = months.length - 1;
        const noise = buildNoiseSeries(totalMonthIndex);

        function targetHeadcount(monthIndex: number): number {
            const trend = baseTrend(monthIndex, totalMonthIndex);
            const noiseAtMonth = noise[monthIndex] ?? 0;
            return trend * (1 + noiseAtMonth);
        }

        const activePeople = new Map<string, ActivePerson>();
        const employmentsById = new Map<string, EmploymentRow>();
        const locationIdByPersonId = new Map<string, string>();
        const genderByPersonId = new Map<string, GenderId>();
        const ethnicBackgroundByPersonId = new Map<string, EthnicBackgroundId>();
        const firstNameByPersonId = new Map<string, string>();
        const lastNameByPersonId = new Map<string, string>();
        const birthDateByPersonId = new Map<string, string>();

        let nextPersonSequence = 1;

        for (const monthEntry of months) {
            console.info(`⚙️ Processing ${monthEntry.year}-${String(monthEntry.month + 1).padStart(2, '0')}...`);

            // Natural attrition (resignations, dismissals, retirements) among currently active people.
            for (const state of Array.from(activePeople.values())) {
                const tenureMonths = monthEntry.index - state.hireMonthIndex;
                if (tenureMonths <= 0) continue;
                const ageYears = state.ageAtHireYears + tenureMonths / 12;
                const hazard = hazardForTenure(tenureMonths, ageYears);
                const roll = drawFloat(`attritionRoll:${state.personId}:${monthEntry.index}`, { min: 0, max: 1 });
                if (roll < hazard) {
                    terminatePerson(state.personId, monthEntry, 'terminationDay');
                }
            }

            // Reconcile active headcount with the target headcount for this month.
            const target = Math.round(targetHeadcount(monthEntry.index));
            const diff = target - activePeople.size;

            if (diff > 0) {
                for (let i = 0; i < diff; i += 1) {
                    hirePerson(monthEntry);
                }
            } else if (diff < 0) {
                const ranked = Array.from(activePeople.keys())
                    .map((personId) => ({
                        personId,
                        rank: drawFloat(`layoffRank:${personId}:${monthEntry.index}`, { min: 0, max: 1 })
                    }))
                    .sort((left, right) => left.rank - right.rank);
                for (let i = 0; i < Math.min(-diff, ranked.length); i += 1) {
                    const candidate = ranked[i];
                    if (candidate === undefined) continue;
                    terminatePerson(candidate.personId, monthEntry, 'layoffDay');
                }
            }
        }

        function hirePerson(monthEntry: MonthEntry): void {
            const sequence = nextPersonSequence;
            nextPersonSequence += 1;
            const personId = `P${String(sequence).padStart(6, '0')}`;
            const employmentId = `EM${String(sequence).padStart(7, '0')}`;

            const locationId = drawWeighted(`location:${personId}`, locationsWeighted);
            const location = locationsById.get(locationId);
            if (location === undefined) throw new Error(`Unknown location '${locationId}' assigned to '${personId}'.`);

            const gender: GenderId = drawFloat(`gender:${personId}`, { min: 0, max: 1 }) < 0.5 ? 'male' : 'female';
            const ethnicBackgroundId = drawWeighted(`ethnicity:${personId}`, location.ethnicities);
            const localeKey = drawWeighted(`locale:${personId}`, location.locales);
            const localeFaker = localesByKey[localeKey];
            if (localeFaker === undefined) throw new Error(`Unknown locale '${localeKey}' assigned to '${personId}'.`);

            const ageAtHireYears = ageAtHireYearsFor(personId);
            const hireDate = randomDateInMonth(monthEntry, personId, 'hireDay');
            const birthDate = birthDateFromHire(hireDate, ageAtHireYears);

            localeFaker.seed(drawInt(`fakerSeed:${personId}`, { min: 0, max: 2_147_483_647 }));
            const firstName = localeFaker.person.firstName(gender);
            const lastName = localeFaker.person.lastName(gender);

            locationIdByPersonId.set(personId, locationId);
            genderByPersonId.set(personId, gender);
            ethnicBackgroundByPersonId.set(personId, ethnicBackgroundId);
            firstNameByPersonId.set(personId, firstName);
            lastNameByPersonId.set(personId, lastName);
            birthDateByPersonId.set(personId, formatDate(birthDate));

            employmentsById.set(personId, {
                personId,
                employerId: EMPLOYER_ID,
                employmentId,
                hireDate: formatDate(hireDate),
                terminationDate: ''
            });

            activePeople.set(personId, { ageAtHireYears, personId, hireMonthIndex: monthEntry.index, locationId });
        }

        function terminatePerson(personId: string, monthEntry: MonthEntry, daySalt: string): void {
            const terminationDate = randomDateInMonth(monthEntry, personId, daySalt);
            const employment = employmentsById.get(personId);
            if (employment === undefined) throw new Error(`Missing employment record for '${personId}'.`);
            employment.terminationDate = formatDate(terminationDate);
            activePeople.delete(personId);
        }

        const personIds = Array.from(employmentsById.keys()).sort();

        const peopleCsv = buildCsv(
            ['personId', 'firstName', 'lastName', 'birthDate', 'genderId', 'ethnicBackgroundId', 'locationId'],
            personIds.map((personId) => [
                personId,
                firstNameByPersonId.get(personId) ?? '',
                lastNameByPersonId.get(personId) ?? '',
                birthDateByPersonId.get(personId) ?? '',
                genderByPersonId.get(personId) ?? '',
                ethnicBackgroundByPersonId.get(personId) ?? '',
                locationIdByPersonId.get(personId) ?? ''
            ])
        );

        const employmentRows = personIds.map((personId) => employmentsById.get(personId)).filter((row): row is EmploymentRow => row !== undefined);
        const employmentsCsv = buildCsv(
            ['employmentId', 'personId', 'employerId', 'hireDate', 'terminationDate'],
            employmentRows.map((row) => [row.employmentId, row.personId, row.employerId, row.hireDate, row.terminationDate])
        );

        const locationsCsv = buildCsv(
            ['locationId', 'country', 'city', 'sizeTier'],
            locations.map((location) => [location.id, location.country, location.city, sizeTierFor(location.sizeWeight)])
        );

        await fs.mkdir(WORKFORCE_DIRECTORY, { recursive: true });
        await fs.writeFile(`${APPLICATION_DIRECTORY}/people.csv`, peopleCsv, 'utf8');
        await fs.writeFile(`${WORKFORCE_DIRECTORY}/engagements.csv`, employmentsCsv, 'utf8');
        await fs.writeFile(`${APPLICATION_DIRECTORY}/locations.csv`, locationsCsv, 'utf8');

        await ensureEmployerOrganisation();

        const activeCount = employmentRows.filter((row) => row.terminationDate === '').length;
        console.info(`✅ Generated ${personIds.length} people (${activeCount} currently active) across ${locations.length} locations.`);
    } catch (error) {
        console.error('❌ Error generating global workforce sample data.', error);
    }
}

function buildMonthEntries(now: Date): MonthEntry[] {
    const months: MonthEntry[] = [];
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();
    const currentDay = now.getUTCDate();

    let year = START_YEAR;
    let month = START_MONTH;
    let index = 0;
    while (year < currentYear || (year === currentYear && month <= currentMonth)) {
        const isCurrentMonth = year === currentYear && month === currentMonth;
        months.push({ index, maxDay: isCurrentMonth ? currentDay : undefined, month, year });
        index += 1;
        month += 1;
        if (month > 11) {
            month = 0;
            year += 1;
        }
    }
    return months;
}

function buildNoiseSeries(totalMonthIndex: number): number[] {
    const noise: number[] = [0];
    for (let m = 1; m <= totalMonthIndex; m += 1) {
        const step = (drawFloat(`noiseStep:${m}`, { min: 0, max: 1 }) - 0.5) * 2 * NOISE_STEP;
        const previous = noise[m - 1] ?? 0;
        noise.push(clamp(previous + step, -MAX_NOISE, MAX_NOISE));
    }
    return noise;
}

function baseTrend(monthIndex: number, totalMonthIndex: number): number {
    const x = totalMonthIndex === 0 ? 1 : monthIndex / totalMonthIndex;
    const norm = logisticNorm(x, GROWTH_STEEPNESS, GROWTH_INFLECTION);
    return START_HEADCOUNT + norm * (FINAL_TARGET - START_HEADCOUNT);
}

function logisticNorm(x: number, steepness: number, inflection: number): number {
    const raw = 1 / (1 + Math.exp(-steepness * (x - inflection)));
    const at0 = 1 / (1 + Math.exp(-steepness * (0 - inflection)));
    const at1 = 1 / (1 + Math.exp(-steepness * (1 - inflection)));
    return (raw - at0) / (at1 - at0);
}

function hazardForTenure(tenureMonths: number, ageYears: number): number {
    const monthlyBase = ANNUAL_ATTRITION_RATE / 12;
    let multiplier: number;
    if (tenureMonths <= 3) multiplier = 0.4;
    else if (tenureMonths <= 12) multiplier = 1.8;
    else if (tenureMonths <= 36) multiplier = 1.1;
    else if (tenureMonths <= 84) multiplier = 0.75;
    else multiplier = 0.9;

    let hazard = monthlyBase * multiplier;
    if (ageYears >= 63) hazard += 0.02 + (ageYears - 63) * 0.03;
    return Math.min(hazard, 0.95);
}

function ageAtHireYearsFor(personId: string): number {
    const a = drawFloat(`age1:${personId}`, { min: 0, max: 1 });
    const b = drawFloat(`age2:${personId}`, { min: 0, max: 1 });
    const c = drawFloat(`age3:${personId}`, { min: 0, max: 1 });
    const triangular = (a + b + c) / 3;
    return 19 + triangular * 36;
}

function randomDateInMonth(monthEntry: MonthEntry, personId: string, salt: string): Date {
    const daysInMonth = new Date(Date.UTC(monthEntry.year, monthEntry.month + 1, 0)).getUTCDate();
    const upperDay = Math.max(1, Math.min(monthEntry.maxDay ?? daysInMonth, daysInMonth));
    const day = drawInt(`${salt}:${personId}:${monthEntry.index}`, { min: 1, max: upperDay });
    return new Date(Date.UTC(monthEntry.year, monthEntry.month, day));
}

function birthDateFromHire(hireDate: Date, ageAtHireYears: number): Date {
    const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000;
    return new Date(hireDate.getTime() - ageAtHireYears * millisecondsPerYear);
}

function formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// The same key always draws the same value, so the generated data is repeatable. A value is taken from a hash of its key.
function drawFraction(key: string): number {
    return createHash('sha256').update(key).digest().readUIntBE(0, 6) / 2 ** 48;
}

function drawFloat(key: string, { max, min }: { max: number; min: number }): number {
    return min + drawFraction(key) * (max - min);
}

function drawInt(key: string, { max, min }: { max: number; min: number }): number {
    return min + Math.floor(drawFraction(key) * (max - min + 1));
}

// Picks a value from '[weight, value]' pairs, each in proportion to its weight.
function drawWeighted<T>(key: string, pairs: [number, T][]): T {
    const totalWeight = pairs.reduce((total, [weight]) => total + weight, 0);
    let remaining = drawFraction(key) * totalWeight;
    for (const [weight, value] of pairs) {
        remaining -= weight;
        if (remaining < 0) return value;
    }
    const lastPair = pairs.at(-1);
    if (lastPair === undefined) throw new Error(`No values to draw from for '${key}'.`);
    return lastPair[1];
}

function normalizeWeights<T>(pairs: [number, T][]): [number, T][] {
    const sum = pairs.reduce((total, [weight]) => total + weight, 0);
    return pairs.map(([weight, value]): [number, T] => [weight / sum, value]);
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function sizeTierFor(sizeWeight: number): 'headquarters' | 'major' | 'medium' | 'small' {
    if (sizeWeight >= 15) return 'headquarters';
    if (sizeWeight >= 6) return 'major';
    if (sizeWeight >= 3) return 'medium';
    return 'small';
}

function buildCsv(headers: string[], rows: string[][]): string {
    const lines = [headers, ...rows].map((row) => row.map(quoteCsvValue).join(','));
    return `${lines.join('\n')}\n`;
}

function quoteCsvValue(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

async function ensureEmployerOrganisation(): Promise<void> {
    const contents = await fs.readFile(ORGANISATIONS_FILE, 'utf8');
    if (contents.includes(`"${EMPLOYER_ID}"`)) return;
    const row = `"${EMPLOYER_ID}","Vilanova Global Group, S.A."\n`;
    await fs.writeFile(ORGANISATIONS_FILE, contents.endsWith('\n') ? `${contents}${row}` : `${contents}\n${row}`, 'utf8');
}

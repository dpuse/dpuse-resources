// External Dependencies
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';

// Types ───────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface DirectoryEntry {
    name: string;
    typeId: 'folder' | 'object';
}

interface DirectoryFolderEntry extends DirectoryEntry {
    childCount: number;
    typeId: 'folder';
}

interface DirectoryObjectEntry extends DirectoryEntry {
    id: string;
    lastModifiedAt: number;
    size: number;
    typeId: 'object';
}

// A file uploaded by hand, outside the release, because it is too large for it. It is not in the repository, so the
// index cannot find it on disk.
interface ManualObject {
    folderPath: string;
    indexId: string;
    lastModifiedAt: number;
    name: string;
    note: string; // What the file is and why it is uploaded by hand.
    size: number;
}

// Constants ───────────────────────────────────────────────────────────────────────────────────────────────────────────

const MANUAL_OBJECTS = (JSON.parse(await fs.readFile(new URL('buildIndexes_.json', import.meta.url), 'utf8')) as { MANUAL_OBJECTS: ManualObject[] }).MANUAL_OBJECTS;

// Processing ──────────────────────────────────────────────────────────────────────────────────────────────────────────

await buildDirectoryIndex('application');

await buildDirectoryIndex('fileStore');

// Helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

async function buildDirectoryIndex(id: string): Promise<void> {
    try {
        console.info(`🚀 Building directory index for identifier '${id}'...`);
        const index: Record<string, DirectoryEntry[]> = {};

        async function listDirectoryEntriesRecursively(directoryPath: string, names: string[]): Promise<void> {
            console.info(`⚙️ Processing directory '${directoryPath}'...`);
            const entries: DirectoryEntry[] = [];
            const localDirectoryPath = directoryPath.slice(`./public/${id}`.length);
            index[localDirectoryPath] = entries;
            for (const name of names) {
                const itemPath = `${directoryPath}/${name}`;
                try {
                    const stats = await fs.stat(itemPath);
                    if (stats.isDirectory()) {
                        const nextLevelChildren = await fs.readdir(itemPath);
                        const folderEntry: DirectoryFolderEntry = { childCount: nextLevelChildren.length, name, typeId: 'folder' };
                        entries.push(folderEntry);
                        await listDirectoryEntriesRecursively(itemPath, nextLevelChildren);
                    } else {
                        const objectEntry: DirectoryObjectEntry = {
                            id: buildObjectId(id, `${localDirectoryPath}/${name}`),
                            lastModifiedAt: stats.mtimeMs,
                            name,
                            size: stats.size,
                            typeId: 'object'
                        };
                        entries.push(objectEntry);
                    }
                } catch (error) {
                    throw new Error(`Unable to get information for '${name}' in 'buildDirectoryIndex'. ${String(error)}`);
                }
            }
            entries.sort((left, right) => {
                const typeComparison = left.typeId.localeCompare(right.typeId);
                return typeComparison === 0 ? left.name.localeCompare(right.name) : typeComparison;
            });
        }

        const toplevelNames = await fs.readdir(`./public/${id}`);
        await listDirectoryEntriesRecursively(`./public/${id}`, toplevelNames);
        addManualObjects(id, index);
        await fs.writeFile(`./public/${id}Index.json`, JSON.stringify(index), 'utf8');
        console.info('✅ Directory index built.');
    } catch (error) {
        console.error('❌ Error building directory index.', error);
    }
}

// The same file always gets the same id, as long as it keeps its path: a hash of the index and the path, 21 characters
// long like the random ids used before.
function buildObjectId(indexId: string, path: string): string {
    return createHash('sha256').update(`${indexId}:${path}`).digest('base64url').slice(0, 21);
}

// Adds the files uploaded by hand to their folders, and counts them in each folder's child count.
function addManualObjects(id: string, index: Record<string, DirectoryEntry[]>): void {
    for (const { folderPath, lastModifiedAt, name, size } of MANUAL_OBJECTS.filter(({ indexId }) => indexId === id)) {
        const entries = index[folderPath];
        if (entries == null) throw new Error(`Folder '${folderPath}' for manually uploaded '${name}' is not in the '${id}' index.`);
        const objectEntry: DirectoryObjectEntry = { id: buildObjectId(id, `${folderPath}/${name}`), lastModifiedAt, name, size, typeId: 'object' };
        entries.push(objectEntry);
        entries.sort((left, right) => left.typeId.localeCompare(right.typeId) || left.name.localeCompare(right.name));

        const separatorIndex = folderPath.lastIndexOf('/');
        const parentEntries = index[folderPath.slice(0, separatorIndex)] ?? [];
        const folderEntry = parentEntries.find((entry): entry is DirectoryFolderEntry => entry.typeId === 'folder' && entry.name === folderPath.slice(separatorIndex + 1));
        if (folderEntry != null) folderEntry.childCount++;
    }
}

// TODO: Old code for reference purposes.

// External Dependencies
// import { promises as fs } from 'node:fs';
// import { nanoid } from 'nanoid';

// Types ───────────────────────────────────────────────────────────────────────────────────────────────────────────────

// interface DirectoryEntry {
//     name: string;
//     typeId: 'folder' | 'object';
// }

// interface DirectoryFolderEntry extends DirectoryEntry {
//     childCount: number;
//     typeId: 'folder';
// }

// interface DirectoryObjectEntry extends DirectoryEntry {
//     id: string;
//     lastModifiedAt: number;
//     size: number;
//     typeId: 'object';
// }

// Actions ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

// export async function buildDirectoryIndex(id: string, outputDirectory = 'public'): Promise<void> {
//     try {
//         console.info(`🚀 Building directory index for identifier '${id}'...`);
//         const index: Record<string, DirectoryEntry[]> = {};

//         async function listDirectoryEntriesRecursively(directoryPath: string, names: string[]): Promise<void> {
//             console.info(`⚙️ Processing directory '${directoryPath}'...`);
//             const entries: DirectoryEntry[] = [];
//             const localDirectoryPath = directoryPath.slice(`${outputDirectory}/${id}`.length);
//             index[localDirectoryPath === '' ? '/' : localDirectoryPath] = entries;
//             for (const name of names) {
//                 const itemPath = `${directoryPath}/${name}`;
//                 try {
//                     const stats = await fs.stat(itemPath);
//                     if (stats.isDirectory()) {
//                         const nextLevelChildren = await fs.readdir(itemPath);
//                         const folderEntry: DirectoryFolderEntry = { childCount: nextLevelChildren.length, name, typeId: 'folder' };
//                         entries.push(folderEntry);
//                         await listDirectoryEntriesRecursively(itemPath, nextLevelChildren);
//                     } else {
//                         const objectEntry: DirectoryObjectEntry = { id: nanoid(), lastModifiedAt: stats.mtimeMs, name, size: stats.size, typeId: 'object' };
//                         entries.push(objectEntry);
//                     }
//                 } catch (error) {
//                     throw new Error(`Unable to get information for '${name}' in 'buildDirectoryIndex'. ${String(error)}`);
//                 }
//             }
//             entries.sort((left, right) => {
//                 const typeComparison = left.typeId.localeCompare(right.typeId);
//                 return typeComparison === 0 ? left.name.localeCompare(right.name) : typeComparison;
//             });
//         }

//         const toplevelNames = await fs.readdir(`${outputDirectory}/${id}`);
//         await listDirectoryEntriesRecursively(`${outputDirectory}/${id}`, toplevelNames);
//         await fs.writeFile(`./${outputDirectory}/${id}Index.json`, JSON.stringify(index), 'utf8');
//         console.info('✅ Directory index built.');
//     } catch (error) {
//         console.error('❌ Error building directory index.', error);
//     }
// }

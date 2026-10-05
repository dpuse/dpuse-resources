// External Dependencies
import { promises as fs } from 'node:fs';
import { nanoid } from 'nanoid';
// Actions ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function buildDirectoryIndex(id, outputDirectory = 'public') {
    try {
        console.info(`🚀 Building directory index for identifier '${id}'...`);
        const index = {};
        async function listDirectoryEntriesRecursively(directoryPath, names) {
            console.info(`⚙️ Processing directory '${directoryPath}'...`);
            const entries = [];
            const localDirectoryPath = directoryPath.slice(`${outputDirectory}/${id}`.length);
            index[localDirectoryPath === '' ? '/' : localDirectoryPath] = entries;
            for (const name of names) {
                const itemPath = `${directoryPath}/${name}`;
                try {
                    const stats = await fs.stat(itemPath);
                    if (stats.isDirectory()) {
                        const nextLevelChildren = await fs.readdir(itemPath);
                        const folderEntry = { childCount: nextLevelChildren.length, name, typeId: 'folder' };
                        entries.push(folderEntry);
                        await listDirectoryEntriesRecursively(itemPath, nextLevelChildren);
                    }
                    else {
                        const objectEntry = { id: nanoid(), lastModifiedAt: stats.mtimeMs, name, size: stats.size, typeId: 'object' };
                        entries.push(objectEntry);
                    }
                }
                catch (error) {
                    throw new Error(`Unable to get information for '${name}' in 'buildDirectoryIndex'. ${String(error)}`);
                }
            }
            entries.sort((left, right) => {
                const typeComparison = left.typeId.localeCompare(right.typeId);
                return typeComparison === 0 ? left.name.localeCompare(right.name) : typeComparison;
            });
        }
        const toplevelNames = await fs.readdir(`${outputDirectory}/${id}`);
        await listDirectoryEntriesRecursively(`${outputDirectory}/${id}`, toplevelNames);
        await fs.writeFile(`./${outputDirectory}/${id}Index.json`, JSON.stringify(index), 'utf8');
        console.info('✅ Directory index built.');
    }
    catch (error) {
        console.error('❌ Error building directory index.', error);
    }
}
//# sourceMappingURL=buildIndexes.js.map
import * as fs from 'fs';

// Split a text file into smaller chunks and return the chunk file paths
export const splitIntoChunks = (filePath: string, chunkSize: number = 5): string[] => {
    const text = fs.readFileSync(filePath, 'utf-8');
    const chunks = text.trim().split('\n\n').filter(chunk => chunk.trim());
    const chunkFilePaths: string[] = [];

    for (let i = 0; i < chunks.length; i += chunkSize) {
        const filePathNoExt = filePath.split('.')[0];
        const chunkFilePath = `${filePathNoExt}-chunk-${Math.floor(i / chunkSize) + 1}.txt`;
        chunkFilePaths.push(chunkFilePath);
        const chunkContent = chunks.slice(i, i + chunkSize).join('\n\n');
        fs.writeFileSync(chunkFilePath, chunkContent + '\n\n');
    }

    return chunkFilePaths;
}
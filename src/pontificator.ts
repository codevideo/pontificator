import * as fs from 'fs';
import path from 'path';
import { cleanMdx } from './cleanMdx';
import { splitIntoChunks } from './splitIntoChunks';
import { generateAudio } from './generateAudio';
import { combineAudio } from './combineAudio';

export const pontificator = async (): Promise<void> => {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Usage: ts-node pontificator.ts <file_path>');
        process.exit(1);
    }

    // Resolve the provided path to an absolute path
    const absoluteFilePath = path.resolve(process.cwd(), filePath);

    // Extract the base name (filename without extension)
    const absoluteFilePathNoExt = absoluteFilePath.replace(/\.[^/.]+$/, '');

    // Extract the absolute path to containing directory
    const absoluteDirPath = path.dirname(absoluteFilePath);

    console.log('====================================================');
    console.log(`\x1b[36mStarting pontificator...\x1b[0m`);
    console.log('====================================================');
    console.log(`\x1b[32mFile to process:\x1b[0m       ${filePath}`);
    console.log(`\x1b[32mAbsolute path:\x1b[0m        ${absoluteFilePath}`);
    console.log('====================================================');

    // 1. Convert MDX file to plain text
    console.log(`\x1b[34mCleaning MDX file: ${absoluteFilePathNoExt}.mdx...\x1b[0m`);
    cleanMdx(`${absoluteFilePathNoExt}.mdx`);
    console.log(`\x1b[32mMDX file cleaned and saved as .txt\x1b[0m`);

    // 2. Split the text into smaller chunks
    console.log(`\x1b[34mSplitting ${absoluteFilePathNoExt}.txt into smaller chunks...\x1b[0m`);
    const chunkFilePaths = splitIntoChunks(`${absoluteFilePathNoExt}.txt`);
    console.log(`\x1b[32mCreated ${chunkFilePaths.length} chunk file(s):\x1b[0m`, chunkFilePaths);

    // 3. Generate audio from chunked text
    console.log('\x1b[34mGenerating audio for each chunk...\x1b[0m');
    for (const chunkFilePath of chunkFilePaths) {
        console.log(`  • Processing chunk file: ${chunkFilePath}`);
        await generateAudio(chunkFilePath);
        console.log(`  \x1b[32mAudio generated:\x1b[0m     ${chunkFilePath.replace('.txt', '.mp3')}`);
    }

    // 4. Combine audio files
    console.log('\x1b[34mCombining all chunked MP3 files...\x1b[0m');
    const success = await combineAudio(absoluteDirPath);
    if (!success) {
        console.error('\x1b[31mError combining audio files\x1b[0m');
        process.exit(1);
    }
    console.log('\x1b[32mAll chunked MP3 files combined!\x1b[0m');

    // 5. Clean up chunk files
    console.log('\x1b[34mCleaning up temporary chunk files...\x1b[0m');
    chunkFilePaths.forEach(chunkFile => {
        const mp3File = chunkFile.replace('.txt', '.mp3');
        fs.unlinkSync(chunkFile);
        fs.unlinkSync(mp3File);
        console.log(`  \x1b[31mDeleted:\x1b[0m ${chunkFile} and ${mp3File}`);
    });

    console.log('====================================================');
    console.log('\x1b[32mPontification complete!\x1b[0m');
    console.log('====================================================');
};

pontificator();

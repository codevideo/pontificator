import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'os';

export const combineAudio = async (absoluteDirPath: string): Promise<boolean> => {
  // List and filter all .mp3 files in the directory
  const mp3Files = fs
    .readdirSync(absoluteDirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.mp3'))
    .map((dirent) => dirent.name)
    .sort();

  if (mp3Files.length === 0) {
    console.log(`No MP3 files found in ${absoluteDirPath}`);
    return false;
  }

  const outputFile = path.join(absoluteDirPath, 'audio.mp3');

  // Create the fluent-ffmpeg command
  let command = ffmpeg();
  mp3Files.forEach((mp3File) => {
    command = command.input(path.join(absoluteDirPath, mp3File));
  });

  // Wrap the ffmpeg merge in a promise
  try {
    await new Promise<void>((resolve, reject) => {
      command
        .on('error', (err) => reject(err))
        .on('end', () => resolve())
        .mergeToFile(outputFile, tmpdir());
    });
    console.log(`Combined ${mp3Files.length} audio files into ${outputFile}`);
    return true;
  } catch (err) {
    console.error('Error combining audio:', err);
    return false;
  }
};

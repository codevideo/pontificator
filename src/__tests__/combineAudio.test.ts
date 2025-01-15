import * as fs from 'fs';
import { Dirent } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { combineAudio } from '../combineAudio';
import * as path from 'path';

jest.mock('fs');
jest.mock('fluent-ffmpeg');
jest.mock('path');

describe('combineAudio', () => {
    const mockFs = fs as jest.Mocked<typeof fs>;
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock path.resolve to return a predictable path
        (path.resolve as jest.Mock).mockReturnValue('/mock/example');
        // Mock path.join to simply join with forward slashes
        (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    });

    test('combines audio files correctly', () => {
        // Create mock Dirent objects with proper typing
        const createMockDirent = (fileName: string): Dirent => ({
            name: fileName,
            isFile: () => true,
            isDirectory: () => false,
            isBlockDevice: () => false,
            isCharacterDevice: () => false,
            isSymbolicLink: () => false,
            isFIFO: () => false,
            isSocket: () => false
        } as Dirent);

        const mockDirents = [
            createMockDirent('file1.mp3'),
            createMockDirent('file2.mp3')
        ];
        
        mockFs.readdirSync.mockReturnValue(mockDirents);

        const mockCommand = {
            input: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            mergeToFile: jest.fn()
        };
        
        // Create a mock FFmpeg constructor
        const mockFfmpeg = jest.fn(() => mockCommand);
        (ffmpeg as unknown as jest.Mock) = mockFfmpeg;
        mockFfmpeg.mockReturnValue(mockCommand);

        combineAudio('test/path');

        // Verify readdirSync was called with the correct path
        expect(mockFs.readdirSync).toHaveBeenCalledWith('/mock/example');
        
        // Verify input was called for each MP3 file
        expect(mockCommand.input).toHaveBeenCalledTimes(2);
        expect(mockCommand.input).toHaveBeenCalledWith('/mock/example/file1.mp3');
        expect(mockCommand.input).toHaveBeenCalledWith('/mock/example/file2.mp3');
        
        // Verify mergeToFile was called
        expect(mockCommand.mergeToFile).toHaveBeenCalled();
        expect(mockCommand.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockCommand.on).toHaveBeenCalledWith('end', expect.any(Function));
    });

    test('handles empty directory', () => {
        mockFs.readdirSync.mockReturnValue([]);
        const consoleSpy = jest.spyOn(console, 'log');
        
        // Mock path.resolve for consistent path in console.log
        (path.resolve as jest.Mock).mockReturnValue('/mock/example');

        combineAudio('test/path');

        expect(consoleSpy).toHaveBeenCalledWith('No MP3 files found in /mock/example');
        consoleSpy.mockRestore();
    });
});
import * as path from 'path';
import { cleanMdx } from '../cleanMdx';
import { splitIntoChunks } from '../splitIntoChunks';
import { generateAudio } from '../generateAudio';
import { combineAudio } from '../combineAudio';
import { pontificator } from '../pontificator';

jest.mock('../cleanMdx');
jest.mock('../splitIntoChunks');
jest.mock('../generateAudio');
jest.mock('../combineAudio');
jest.mock('fs');
jest.mock('path');

describe('pontificator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock path.parse
        (path.parse as jest.Mock).mockReturnValue({ name: 'test' });
        // Set a default test file
        process.argv[2] = 'test.mdx';
    });

    afterEach(() => {
        // Clean up mocks
        jest.resetAllMocks();
    });

    test('executes all steps in correct order', async () => {
        (splitIntoChunks as jest.Mock).mockReturnValue(['chunk1.txt', 'chunk2.txt']);

        await pontificator();

        expect(cleanMdx).toHaveBeenCalledWith('test.mdx');
        expect(splitIntoChunks).toHaveBeenCalledWith('test.txt');
        expect(generateAudio).toHaveBeenCalledTimes(2);
        expect(combineAudio).toHaveBeenCalledWith('test');
    });

    test('handles missing file path', async () => {
        // Save original argv
        const originalArgv = [...process.argv];
        // Set argv to minimum required elements without the file argument
        process.argv = ['node', 'script.js'];
        
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
            // Throw an error to stop execution
            throw new Error('process.exit() was called');
        });
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        // We expect the function to throw due to our mock implementation of process.exit
        await expect(pontificator()).rejects.toThrow('process.exit() was called');
    
        expect(mockConsoleError).toHaveBeenCalledWith('Usage: ts-node pontificator.ts <file_path>');
        expect(mockExit).toHaveBeenCalledWith(1);
    
        // Restore original argv
        process.argv = originalArgv;
        
        // Clean up spies
        mockExit.mockRestore();
        mockConsoleError.mockRestore();
    });
});
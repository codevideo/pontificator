import * as fs from 'fs';
import { splitIntoChunks } from '../splitIntoChunks';

jest.mock('fs');

describe('splitIntoChunks', () => {
    const mockFs = fs as jest.Mocked<typeof fs>;
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('splits content into correct number of chunks', () => {
        const mockContent = 'chunk1\n\nchunk2\n\nchunk3\n\nchunk4\n\nchunk5\n\nchunk6';
        mockFs.readFileSync.mockReturnValue(mockContent);

        const chunks = splitIntoChunks('test.txt', 2);

        expect(chunks).toHaveLength(6);
        expect(mockFs.writeFileSync).toHaveBeenCalledTimes(3); // 6 chunks / 2 per file = 3 files
    });

    test('handles empty content', () => {
        mockFs.readFileSync.mockReturnValue('');

        const chunks = splitIntoChunks('test.txt');

        expect(chunks).toHaveLength(0);
        expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
});
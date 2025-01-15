import * as fs from 'fs';
import fetch from 'isomorphic-fetch';
import { generateAudio } from '../generateAudio';

jest.mock('fs');
jest.mock('isomorphic-fetch');

describe('generateAudio', () => {
    const mockFs = fs as jest.Mocked<typeof fs>;
    
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ELEVEN_LABS_API_KEY = 'test-key';
    });

    test('skips generation if file exists and no force overwrite', async () => {
        mockFs.existsSync.mockReturnValue(true);
        const consoleSpy = jest.spyOn(console, 'log');

        await generateAudio('test.txt', false);

        expect(consoleSpy).toHaveBeenCalledWith('Audio file already exists. Skipping...');
    });

    test('generates audio using ElevenLabs API', async () => {
        mockFs.existsSync.mockReturnValue(false);
        mockFs.readFileSync.mockReturnValue('Test content');
        
        const mockResponse = {
            ok: true,
            arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
        };
        (fetch as jest.Mock).mockResolvedValue(mockResponse);

        await generateAudio('test.txt', true);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('elevenlabs.io'),
            expect.any(Object)
        );
        expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
});
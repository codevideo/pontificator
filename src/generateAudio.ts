import * as fs from 'fs';
import * as path from 'path';
import fetch from 'isomorphic-fetch';
import * as process from 'process';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

/**
 * Load environment variables from .env
 */
function loadEnvVariables(): void {
    const dotenvPath = path.resolve('.env');
    if (fs.existsSync(dotenvPath)) {
        dotenv.config({ path: dotenvPath });
    }
}

/**
 * Represents voice settings for ElevenLabs TTS.
 */
class VoiceSettings {
    public stability: number;
    public similarity_boost: number;

    constructor(stability: number, similarity_boost: number) {
        this.stability = stability;
        this.similarity_boost = similarity_boost;
    }
}

/**
 * Represents request body for ElevenLabs TTS.
 */
class TextToSpeechRequest {
    public text: string;
    public model_id: string;
    public voice_settings: VoiceSettings;

    constructor(text: string, modelId: string, voiceSettings: VoiceSettings) {
        this.text = text;
        this.model_id = modelId;
        this.voice_settings = voiceSettings;
    }
}

/**
 * Generate audio from text in a file.
 *
 * @param fileToChunk - Path to the text file to convert
 * @param forceOverwrite - Whether to overwrite existing MP3 file if found
 */
export const generateAudio = async (
    fileToChunk: string,
    forceOverwrite: boolean = false
): Promise<void> => {
    const fileNoExt = fileToChunk.split('.')[0];

    // Read the text to speak from the file
    const textToSpeak = fs.readFileSync(fileToChunk, 'utf-8');

    // The output audio file name
    const audioFilePath = `${fileNoExt}.mp3`;

    // If the file already exists and forceOverwrite is false, skip
    if (fs.existsSync(audioFilePath) && !forceOverwrite) {
        console.log('Audio file already exists. Skipping...');
        return;
    }

    // If ELEVEN_LABS_API_KEY is defined, use the ElevenLabs API
    if (process.env.ELEVEN_LABS_API_KEY) {
        // Prepare request headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
            Accept: 'audio/mpeg',
        };

        // Build the request body
        const body = new TextToSpeechRequest(
            textToSpeak,
            'eleven_turbo_v2',
            new VoiceSettings(0.5, 0.95)
        );

        try {
            // Make the POST request to ElevenLabs
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_LABS_VOICE_ID ?? ''}`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Write the resulting audio data to an MP3 file
            const audioBuffer = await response.arrayBuffer();
            fs.writeFileSync(audioFilePath, Buffer.from(audioBuffer));
            console.log(`Audio file ${audioFilePath} generated successfully.`);
        } catch (error) {
            console.error('Error:', error);
            return;
        }
    } else {
        // Fallback if no ELEVEN_LABS_API_KEY is found
        // (In Python we used pyttsx3, but Node has no direct equivalent built-in.)
        // You could integrate another TTS library here if desired.
        console.log(
            `No ELEVEN_LABS_API_KEY found. Fallback: skipping TTS generation for ${fileNoExt}.`
        );
    }
}

/**
 * Main function to handle CLI usage.
 */
async function main(): Promise<void> {
    loadEnvVariables();

    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.log('Usage: ts-node generateAudio.ts file_to_chunk.txt');
        process.exit(1);
    }

    // If argument is "all", generate audio for all files with "chunk" in their name
    // within the 'example' directory, then combine them (calling the combine_audio.py script).
    if (args[0] === 'all') {
        const exampleDir = path.join(process.cwd(), 'example');
        const files = fs.readdirSync(exampleDir);

        for (const file of files) {
            if (file.includes('chunk') && file.endsWith('.txt')) {
                await generateAudio(path.join(exampleDir, file), false);
            }
        }

        // Optionally call your Python script to combine the audio.
        // If you still want to rely on a Python script, you can do:
        try {
            execSync('python python/combine_audio.py example/blog-post-chunk', {
                stdio: 'inherit',
            });
        } catch (error) {
            console.error('Error running combine_audio.py:', error);
        }

        process.exit(0);
    }

    // Generate audio for a single specified file
    const fileToChunk = args[0];
    await generateAudio(fileToChunk, false);
}

// Run the main function if called directly (instead of being imported)
if (require.main === module) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
import os
from dotenv import load_dotenv
import sys
import json
import requests
import pyttsx3

class VoiceSettings:
    def __init__(self, stability, similarity_boost):
        self.stability = stability
        self.similarity_boost = similarity_boost

class VoiceSettingsEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, VoiceSettings):
            return obj.__dict__
        return json.JSONEncoder.default(self, obj)

class TextToSpeechRequest:
    def __init__(self, text, model_id, voice_settings):
        self.text = text
        self.model_id = model_id
        self.voice_settings = voice_settings

class TextToSpeechRequestEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, TextToSpeechRequest):
            return {
                'text': obj.text,
                'model_id': obj.model_id,
                'voice_settings': obj.voice_settings.__dict__  # Serialize VoiceSettings separately
            }
        return json.JSONEncoder.default(self, obj)

def generate_audio(file_to_chunk, force_overwrite=False):
    file_no_ext = file_to_chunk.split('.')[0]
    # Read the text to speak from the file
    with open(file_to_chunk, 'r', encoding='utf-8') as file:
        text_to_speak = file.read()

    # get the audio folder path from the file name
    audio_folder_path = os.path.join(os.getcwd(), file_to_chunk)
    # If the file exists already, don't do anything
    audio_file_path = f"{file_no_ext}.mp3"
    if os.path.exists(audio_file_path) and not force_overwrite:
        print(f"Audio file already exists. Skipping...")
        return

    # If API key is defined, use elevenlabs API
    if 'ELEVEN_LABS_API_KEY' in os.environ:
        # Headers for elevenlabs
        headers = {
            'Content-Type': 'application/json',
            'xi-api-key': os.environ.get('ELEVEN_LABS_API_KEY', ''),
            'Accept': 'audio/mpeg',
        }

        # Create TextToSpeechRequest object
        body = TextToSpeechRequest(
            text=text_to_speak,
            model_id='eleven_turbo_v2',
            voice_settings=VoiceSettings(stability=0.5, similarity_boost=0.95)
        )

        try:
            # Make POST request to elevenlabs
            response = requests.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{os.environ.get('ELEVEN_LABS_VOICE_ID', '')}",
                headers=headers,
                data=json.dumps(body, cls=TextToSpeechRequestEncoder)  # Use the custom encoder
            )

            response.raise_for_status()

            # Write the byte data to an MP3 file
            with open(audio_file_path, 'wb') as file:
                file.write(response.content)
            
            print(f"Audio file {audio_file_path} generated successfully.")

        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return None

    # If API key not defined, use pyttsx3 to do text-to-speech
    else:
        engine = pyttsx3.init()
        engine.save_to_file(text_to_speak, audio_file_path)
        engine.runAndWait()
        print("Audio file generated successfully.")

def load_env_variables():
    dotenv_path = '.env'  # Path to your .env file
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)

if __name__ == "__main__":
    # Load environment variables
    load_env_variables()
    
    if len(sys.argv) != 2:
        print("Usage: python generate_audio.py file_to_chunk.txt")
        sys.exit(1)

    # if second argument is "all", find all files with the word "chunk" in it and generate audio for each, then call combine_audio.py
    if sys.argv[1] == "all":
        for file in os.listdir("example"):
            if "chunk" in file and file.endswith(".txt"):
                generate_audio(f"example/{file}", force_overwrite=False)
        os.system("python python/combine_audio.py example/blog-post-chunk")
        sys.exit(0)

    file_to_chunk = sys.argv[1]

    generate_audio(file_to_chunk, force_overwrite=False)

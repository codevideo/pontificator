from pydub import AudioSegment
import os
import sys

def combine_audio(file_path):
    combined_audio = AudioSegment.silent(duration=0)

    # List all mp3 files in the directory
    mp3_files = [
        file for file in os.listdir("./example")
        if file.endswith(".mp3")
    ]


    # Sort the mp3 files based on their names
    mp3_files.sort()

    # Combine audio segments
    for mp3_file in mp3_files:
        audio_segment = AudioSegment.from_mp3(f"./example/{mp3_file}")
        combined_audio += audio_segment

    # Export the combined audio
    combined_audio.export(f"example/audio.mp3", format="mp3")

    # Print how many we combined
    print(f"Combined {len(mp3_files)} audio files into example/audio.mp3")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python combine_audio.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    combine_audio(file_path)

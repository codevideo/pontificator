#!/usr/bin/env python3
import os
import sys
import subprocess

def convert_to_text(file_path):
    # Convert MDX file to plain text using Pandoc and custom filters
    subprocess.run([
        "python3", "python/clean_mdx.py", f"{file_path}.mdx"
    ])

def chunk_text(file_path):
    # Split the text into chunks
    subprocess.run([
        "python3",
        "python/split_into_chunks.py",
        f"{file_path}.txt"
    ])

    end_file_path = file_path.split('/')[-1]

    # Get list of chunk files starts with file_path-chunk- and is txt
    chunk_files = [
        file for file in os.listdir("example")
        if file.startswith(f"{end_file_path}-chunk-") and file.endswith(".txt")
    ]
    return chunk_files

def generate_audio(chunk_files):
    # Generate audio from chunked text
    for chunk_file in chunk_files:
        subprocess.run([
            "python3",
            "python/generate_audio.py",
            f"example/{chunk_file}"
        ])

def main():
    if len(sys.argv) != 2:
        print("Usage: python pontificator.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    file_path_no_ext = os.path.splitext(file_path)[0]

    # Convert MDX file to plain text
    convert_to_text(file_path_no_ext)

    # Chunk the text into smaller files
    chunk_files = chunk_text(file_path_no_ext)

    # Generate audio from chunked text
    generate_audio(chunk_files)

    # Combine audio files into one
    subprocess.run([
        "python3",
        "python/combine_audio.py",
        file_path_no_ext
    ])

    # Remove chunk txt and mp3 files
    for chunk_file in chunk_files:
        mp3_file = chunk_file.replace('txt', 'mp3')
        os.remove(f"example/{chunk_file}")
        os.remove(f"example/{mp3_file}")

if __name__ == "__main__":
    main()

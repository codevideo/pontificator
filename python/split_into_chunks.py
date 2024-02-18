#!/usr/bin/env python3
import sys

def split_into_chunks(file_path, chunk_size=5):
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()

    # Split the text into chunks based on multiple consecutive empty lines
    chunks = [chunk.strip() for chunk in text.strip().split('\n\n') if chunk.strip()]

    # Write chunks to files
    for i in range(0, len(chunks), chunk_size):
        file_path_no_ext = file_path.split('.')[0]
        chunk_file_path = f"{file_path_no_ext}-chunk-{i // chunk_size + 1}.txt"
        with open(chunk_file_path, 'w', encoding='utf-8') as chunk_file:
            for chunk in chunks[i:i+chunk_size]:
                chunk_file.write(chunk + '\n\n')

    return chunks

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python split_into_chunks.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    split_into_chunks(file_path)

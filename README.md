# pontificator

Generate studio quality dictated audio files from books, articles, and blog posts.

See an example of a dictated blog post [on one of Chris's blog posts](https://chrisfrew.in/blog/blazor-on-netlify-with-environment-variables/).

## Prerequisites

If you are fine with using the built in text-to-speech software, you can skip this section. If you want to use a payed text-to-speech software, you will need to set up an account and get an API key. We currently support the following vendors:

- Eleven Labs. You'll need to set an `ELEVEN_LABS_API_KEY` - if defined in `.env`, the Eleven Labs text-to-speech API will be used, optionally additionally with `ELEVEN_LABS_VOICE_ID`.
- More coming soon!


## Installation

Activate your virtual environment and install the required packages:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

## Example

Paste any markdown into the `example/blog-post.mdx` file. (Or leave as-is for the example.)

Then, run `pontificator` with the following command:

```python
python3 python/pontificator.py example/blog-post.mdx
```

This will clean up the markdown, chunk it for API calls, and combine the audio chunks to a single .mp3 file reflecting the entire text content of the blog post.

If all goes well, you should get an `audio.mp3` file produced in the `example` directory.

## Advanced Options for Connoisseurs

## Conversion Examples

### Blog Post

```python
python3 python/clean_mdx.py example/blog-post.mdx
```

`blog-post.txt` should be cleaned and ready to be dictated by any text-to-speech software.

### 'Unit Test' Example

```python
python3 python/clean_mdx.py example/test.mdx
```

`test.txt` should be cleaned and ready to be dictated by any text-to-speech software.


## Chunking Examples

In order to avoid rate limits and max character limits of text-to-speech software, it is recommended to chunk the text into smaller files.

### Blog Post

```python
python split_into_chunks.py blog-post.txt
```

This will result in a variety of files with the naming convention `blog-post-chunk-#.txt` where `#` is the chunk number.

## Generate Audio

### Blog Post

```python
python generate_audio.py blog-post-chunk-1.txt
```

### Validation and Verification

Consider validating the produced text with CodeVideo's other tool, [`speech-shield`](https://github.com/codevideo/speech-shield)
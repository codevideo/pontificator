# @fullstackcraftllc/pontificator

Generate studio quality dictated audio files from books, articles, and blog posts.

See an example of a dictated blog post [on one of Chris's blog posts](https://chrisfrew.in/blog/blazor-on-netlify-with-environment-variables/).

## Install in a Node.js Project

```shell
npm install @fullstackcraftllc/pontificator
```

## CLI Usage

```shell
npx @fullstackcraftllc/pontificator <path-to-file-to-dictate>
```

## Prerequisites

If you are fine with using the built in text-to-speech software, you can skip this section. If you want to use a payed text-to-speech software, you will need to set up an account and get an API key. We currently support the following vendors:

- Eleven Labs. You'll need to set an `ELEVEN_LABS_API_KEY` - if defined in `.env`, the Eleven Labs text-to-speech API will be used, optionally additionally with `ELEVEN_LABS_VOICE_ID`.
- More coming soon!


## Installation

Install dependencies:

```shell
npm install
```

## Example

Paste any markdown into the `example/blog-post.mdx` file. (Or leave as-is for the example.)

Then, run `pontificator` with the following command:

```python
npm run start example/blog-post.mdx
```

This will clean up the markdown, chunk it for API calls, and combine the audio chunks to a single .mp3 file reflecting the entire text content of the blog post.

If all goes well, you should get an `audio.mp3` file produced in the `example` directory.

### Validation and Verification

Consider validating the produced text with CodeVideo's other tool, [`speech-shield`](https://github.com/codevideo/speech-shield)
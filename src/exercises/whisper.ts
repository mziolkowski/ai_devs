import {answer, getTask} from "../utils/utils.ts";
// @ts-ignore
import {OpenAIWhisperAudio} from "langchain/document_loaders/fs/openai_whisper_audio";
import OpenAI from "openai";
import * as fs from "fs";
import fetch from 'node-fetch';
import stream from 'stream';
import {promisify} from 'util';

const {msg} = await getTask('whisper');

const regex = /(https?:\/\/[^\s]+)/g;
const url = msg.match(regex);

const pipeline = promisify(stream.pipeline);

const response = await fetch(url);
if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
await pipeline(response.body, fs.createWriteStream('mateusz.mp3'));

// Pierwszy sposób wykorzystujący model OpenAiWhisperAudio z pakietu langchain
// const loader = new OpenAIWhisperAudio("mateusz.mp3", {clientOptions: {apiKey: process.env.OPENAI_API_KEY}})
// const doc = await loader.load()
//
// answer(doc[0].pageContent)

// Drugi sposób wykorzystujący model OpenAI zamiast OpenAiWhisperAudio
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("mateusz.mp3"),
    model: "whisper-1"
});
answer(transcription.text)


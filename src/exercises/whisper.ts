import {answer, getTask} from "../utils/utils.ts";
// @ts-ignore
import {OpenAIWhisperAudio} from "langchain/document_loaders/fs/openai_whisper_audio";
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


const loader = new OpenAIWhisperAudio("mateusz.mp3", {clientOptions: {apiKey: process.env.OPENAI_API_KEY}})
const doc = await loader.load()

answer(doc[0].pageContent)

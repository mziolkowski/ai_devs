import {answer, getTask, token} from "../utils/utils.ts";
import axios from "axios";
import {ChatPromptTemplate, PromptTemplate} from "langchain/prompts";
import {ChatOpenAI, type OpenAIChatInput} from "@langchain/openai";
import {LLMChain} from "langchain/chains";


const systemTemplate = 'You will receive a question in English. You will answer it for me and decide whether it answers the question correctly. If so, answer "YES". If not, answer "NO"' +
    +'### {question} ### ';

const question = 'What is the capital of Italy?'

const taskData = await getTask('liar');

const form = new FormData();
form.append('question', question)

const response = await axios.post(`${process.env.AI_DEVS_API_URL}/task/${token}`, form, {
    headers: {
        'Accept-Encoding': 'gzip'
    }
})
console.log(response.data)

const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{answer}"]
]);

const formattedChatPrompt = await chatPrompt.formatMessages({
    question: question,
    answer: response.data.answer
});

const guardPrompt = `Return YES or NO if the word from prompt: {prompt} is include in the response: {response}. Answer:`
const prompt = PromptTemplate.fromTemplate(guardPrompt);
const chat = new ChatOpenAI<OpenAIChatInput>({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 400
});

// @ts-ignore
const chain = new LLMChain({llm: chat, prompt})
const {text} = await chain.call({prompt: "Rome", response: formattedChatPrompt})
console.log(text)

answer(text)

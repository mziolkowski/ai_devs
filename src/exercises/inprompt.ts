import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "langchain/prompts";

const taskData = await getTask("inprompt");
const {input, question} = taskData;

const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    maxConcurrency: 5
});

const match = question.match(/(\w+)\s*\?$/);
let nameFromQuestion = match ? match[1] : '';

const systemTemplate = `
Using CONTEXT answer the QUESTION. Answer as short as possible and don't give any explanation. Example: "Blue"

### CONTEXT ###
{context}

### QUESTION ###
{question}
`;
const humanTemplate = "{question}"

const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate]
]);

// @ts-ignore
const context = input.filter((element) => element.includes(nameFromQuestion)).join(" ");

const formattedChatPrompt = await chatPrompt.formatMessages({
    question: question,
    context: context,
});

// @ts-ignore
const {content} = await chat.invoke(formattedChatPrompt);
answer(content)

import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "langchain/prompts";


const taskData = await getTask("inprompt");
const {input, question} = taskData;
// console.log(input)

// @ts-ignore
const json = input.map(text => {
    let name = text.split(" ");
   return {
       pageContnt: text,
       metadata: {
           name: name[0],
       }
   };
});
console.log(json)

const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    maxConcurrency: 5
});
const match = question.match(/(\w+)\s*\?$/);
let nameFromQuestion = match ? match[1] : '';
// console.log(nameFromQuestion)

const systemTemplate = "On entry, you will receive a file in which the {pageContent} contains information about the person's eye colour, hair, occupation and breakfast. \n" +
    "In {name} is the person's first name. \n" +
    "\n" +
    "Your task is to answer the question for the name that is in this {question}\n" +
    "\n" +
    "``example\n" +
    "pageContent: \"Kordian has brown eyes, short hair and works as an architect and likes to eat sausages for breakfast the most.\"\n" +
    "\n" +
    "question: `Who is Kordian by profession'.\n" +
    "answer: \"Architect\"\n" +
    "question: \"What does Kordian eat for breakfast?\"\n" +
    "answer: \"sausages\"\n" +
    "question: \"What colour eyes does Kordian have?\"\n" +
    "answer: \"brown\"\n" +
    "```"

const humanTemplate = "Korzystajac z {pageContent} wyciagnij informacje o które jesteś proszony w pytaniu: {question}"

const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate]
]);
// console.log(chatPrompt)

const formattedChatPrompt = await chatPrompt.formatMessages({
    question: question,
    pageContent: json.pageContent,
    name: nameFromQuestion,
});
// console.log(formattedChatPrompt)
//
// @ts-ignore
const {content} = await chat.invoke(formattedChatPrompt);
console.log("content:" + content)
//
answer(content)


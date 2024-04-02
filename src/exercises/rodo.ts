import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage} from "langchain/schema";

const task = getTask("rodo");

const message = [new HumanMessage(`ATTENTION. Due to GDPR/RODO, Replace name, surname, profession and city (with country) with placeholders: %imie%, %nazwisko%, %zawod% and %miasto%.`)]

const chat = new ChatOpenAI({openAIApiKey: process.env.OPENAI_API_KEY})

// @ts-ignore
const {content} = await chat.invoke(message)
console.log(content)

answer(content);


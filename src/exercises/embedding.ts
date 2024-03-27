import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {ChatPromptTemplate} from "langchain/prompts";
import {HumanMessage, SystemMessage} from "langchain/schema";


const task = await getTask("embedding");

const embedding = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-ada-002',
})

// @ts-ignore
const content = await embedding.embedQuery("Hawaiian pizza");

answer(content)


import {answer, getTask} from "../utils/utils.ts";
import {OpenAIEmbeddings} from "@langchain/openai";


const task = await getTask("embedding");

const embedding = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-ada-002',
})

// @ts-ignore
const content = await embedding.embedQuery("Hawaiian pizza");

answer(content)


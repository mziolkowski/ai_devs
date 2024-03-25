import OpenAI from "openai";
import {answer, getTask} from "../utils/utils.ts";


const openAI = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const taskData = await getTask('moderation');

const moderationResponse = await taskData.input.map(async (message: any) => {
    let response = await openAI.moderations.create({input: message})
    const moderationResult = response.results[0];
    console.log(`message: ${message} - moderation result: ${JSON.stringify(moderationResult, null, 2)}`)
    return JSON.stringify(moderationResult.flagged) === "true" ? 1 : 0
})

const answerBody = await Promise.all(moderationResponse)
console.log(`moderationResponse: ${answerBody}`)

answer(answerBody)
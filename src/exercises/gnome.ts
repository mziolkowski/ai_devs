import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI} from "@langchain/openai";
import OpenAI from "openai";

const {msg, url, hint} = await getTask("gnome");

const model = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const response = await model.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
        role: "user",
        content: [{type: "text", text: `${msg}. Return only one word`}, {type: "image_url", image_url: url}]
    }]
})

const ans = response.choices[0].message.content

answer(ans)
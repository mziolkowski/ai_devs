import {answer, getTask} from "../utils/utils.ts";
import OpenAI from "openai";


async function fineTuning() {
    const {input} = await getTask("md2html")
    const model = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

    const messages = [
        {"role": "system", "content": "md2html"},
        {"role": "user", "content": input}
    ];

    const response = await model.chat.completions.create({
        model: "ft:gpt-3.5-turbo-0125:personal:second-test:9FJYoTss",
        messages: messages
    });

    const ans = response.choices[0].message.content;
    console.log(ans)
    answer(ans)
}

fineTuning();

import {answer, getTask} from "../utils/utils.ts";
import OpenAI from "openai";
import {maybeCoerceInteger} from "openai/core";

const {question} = await getTask("tools")

interface typeData {
    reason: string,
    message: {
        function_call: {
            name: string,
            arguments: any,
        },
    },
};

const functionCallingDef = [
    {
        "name": "ToDo",
        "description": "add event to todo list",
        "parameters": {
            "type": "object",
            "properties": {
                "desc": {
                    "type": "string",
                    "description": "description of the user task to be added"
                },
            },
        },
    },
    {
        "name": "Calendar",
        "description": "add event to calnedar",
        "parameters": {
            "type": "object",
            "properties": {
                "desc": {
                    "type": "string",
                    "description": "description of the user task to be added"
                },
                "date": {
                    "type": "string",
                    "description": "date of event in YYY-MM-DD format"
                },
            },
        },
    },
];

const systemPrompt = `Current date is ${new Date().toISOString()}
Classify all tasks as ToDo or Calendar. 
Calendar should be used for all tasks when the date is provided as part of the question. 
Even if the date is passed as "tomorrow", "next week", "pojutrze" etc.
Always answer in user language.`

// @ts-ignore
async function decisionAI(question: string): typeData {
    const chat = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    const response = await chat.chat.completions.create({
        model: "gpt-4",
        messages: [{role: "system", content: systemPrompt},
            {role: "user", content: question}],
        function_call: "auto",
        functions: functionCallingDef
    })
    console.log(response.choices[0])

    return {
        reason: response.choices[0].finish_reason,
        message: response.choices[0].message
    }
}

async function main() {
    const {reason, message} = await decisionAI(question);

    if (reason === "function_call") {
        const response = JSON.parse(message.function_call.arguments);
        response.tool = message.function_call.name;
        console.log("Answer: ", response)
        await answer(response)
    }
}

main()
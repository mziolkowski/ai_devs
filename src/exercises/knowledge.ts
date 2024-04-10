import {answer, getTask} from "../utils/utils.ts";
import OpenAI from "openai";
import fetch from "node-fetch";

const {question} = await getTask("knowledge");

interface typeData {
    reason: string,
    message: {
        function_call: {
            name: string
            arguments: any,
        },
    },
}

const functionCallingDef = [
    {
        "name": "currency",
        "description": "check exchange rate of currency",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "An international standard containing three-letter codes and currency names (ISO 4217 )."
                },
            },
        },
    },
    {
        "name": "country",
        "description": "check population of this country",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "a population name in English"

                },
            },
        },
    },
    {
        "name": "general",
        "description": "all other question",
        "parameters": {
            "type": "object",
            "properties": {
                "answer": {
                    "type": "string",
                    "description": "answer to the question user"
                },
            },
        },
    }
];


async function currency(code: string) {
    const url = "http://api.nbp.pl/api/exchangerates/rates/A/" + code + "?format=json";
    const response = await fetch(url);
    const data = await response.json();
    return data.rates[0].mid;
}

async function country(name: string) {
    const url = `https://restcountries.com/v3.1/name/` + name;
    const response = await fetch(url);
    const data = await response.json();
    return data[0].population;
}

// @ts-ignore
async function decisionOpenAi(question: string): typeData {
    const chat = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    const response = await chat.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: question}],
        functions: functionCallingDef,
        function_call: "auto"
    });
    // console.log(response.choices[0])
    return {
        message: response.choices[0].message,
        reason: response.choices[0].finish_reason,
    }
}

async function main() {
// @ts-ignore
    const {message, reason} = await decisionOpenAi(question);
    let defAnswer = `I dont't know`;
    console.log(reason)
    console.log(message.function_call.name)
    if (reason === "function_call") {
        if (message.function_call.name === `currency`) {
            const currencyCode = JSON.parse(message.function_call.arguments).code;
            defAnswer = await currency(currencyCode);
        } else if (message.function_call.name === 'country') {
            const countryName = JSON.parse(message.function_call.arguments).name;
            defAnswer = await country(countryName)
        } else if (message.function_call.name === "knowledge") {
            const ans = JSON.parse(message.function_call.arguments).answer;
            console.log("ANSWER: ", defAnswer);
            defAnswer = ans;
        }
    }
    console.log(defAnswer)
    await answer(defAnswer);
}

main()



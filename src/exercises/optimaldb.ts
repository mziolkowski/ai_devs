import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "langchain/prompts";
import fetch from "node-fetch";

const fs = require('fs');
const optimizedDbFileName = "optimizedDbFileName.json";

const systemTemplate = ` Goal: optimize the string size.
 IMPORTANT: 
 - Use max string size 3500 character.
 IMPORTANT: 
 - Remove unnesesry words, but keep the context.
 IMPORTANT: 
 - Return the string from user shortly as possible, but keep the context.
 IMPORTANT: 
 - Remember favorite things example: music, books, movie, dance
 IMPORTANT: 
 - Remember inspirations
 
 EXAMPLE###
 source:
 - Wielu nie wie, ale ulubionym instrumentem muzycznym Zygfryda jest ukulele, na którym gra po nocach, kiedy kodowanie na dziś się skończy. Ulubiony fim to Matrix, a ulubiony taniec to Tango. Jej onspiracją jest Jennifer Lopez.
 output:
 - lubi grać na ukulele. Gra w nocy po skonczonym kodowaniu. Ulubiony: film: Matrix, taniec: tango. Inspiracja: Jennifer Lopez`

// @ts-ignore
async function optimizeMessage(text: string): string {
    const model = new ChatOpenAI({openAIApiKey: process.env.OPENAI_API_KEY, modelName: "gpt-3.5-turbo"});
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemTemplate],
        ["user", text]
    ]);

    const formattedPrompt = await prompt.formatMessages({});
    // @ts-ignore
    const {content} = await model.invoke(formattedPrompt)
    console.log("CONTENT: " + content)

    // @ts-ignore
    return content;
}

async function main() {
    const {database} = await getTask("optimaldb");
    const originalDbJson = await fetch(database).then(res => res.json());
    // console.log(bigDatabaseJson)
    const optimizedMessage = {};

    // console.log(newString);
    if (!fs.existsSync(optimizedDbFileName)) {
        for (const friend in originalDbJson) {
            let content = "";
            const message = await originalDbJson[friend].join("\n");
            // @ts-ignore
            optimizedMessage[friend] = [];
            // @ts-ignore
            const info = await optimizeMessage(message);
            // @ts-ignore
            optimizedMessage[friend].push(info);
            // @ts-ignore
            fs.writeFile(optimizedDbFileName, JSON.stringify(optimizedMessage), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
    const readFile = fs.readFileSync(optimizedDbFileName);
    const answerJSON = JSON.parse(readFile)

    let ans = "";
    for (const friend in answerJSON) {
        ans += `\n### ${friend} ###\n`;
        for (const info in answerJSON[friend]) {
            ans += answerJSON[friend][info];
        }
    }
    console.log(ans)
    answer(ans)
}

main()

import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "langchain/prompts";


const chat = new ChatOpenAI({openAIApiKey: process.env.OPENAI_API_KEY});

const systemTemplate = `You will be given information about a well-known person. Your task is to guess who this person is. 
You must remember the information you received in the previous message in order to use this knowledge in the next step. 

RULES:
- If you know the person in question answer YES and name (first name last name) that person.
- If you do not know the person, say the word NO.`

const humanTemplate = `Information about person what I know:
{allHints}`

// @ts-ignore
const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate]
]);

async function task() {
    const maxTries = 8;
    let solved = false;
    let tries = 0;
    let allHints = "";

    while (!solved && tries < maxTries) {
        const {hint} = await getTask("whoami");
        allHints += `- ` + hint + "\n";

        const formattedChatPrompt = await chatPrompt.formatMessages({
            allHints: allHints,
        });

        console.log(allHints)

        // @ts-ignore
        const {content} = await chat.invoke(formattedChatPrompt)
        console.log('CONTENT: ' + content)
        if (content !== 'NO') {
            const {code} = await answer(content);
            if (code === 0) {
                solved = true;
            }
        }
        tries++;
    }
}

task();
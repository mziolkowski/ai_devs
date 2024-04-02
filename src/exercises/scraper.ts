import {ChatOpenAI} from "langchain/chat_models/openai";
import {ChatPromptTemplate} from "langchain/prompts";
import {answer, getTask} from "../utils/utils.ts";

const chat = new ChatOpenAI();

const systemTemplate = `
Message {msg}

Article:
{article}
`;

const humanTemplate = `Question: {question}`;

const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate],
]);

const fetchText = async (url:string) => {
    let tries = 5;
    let timeout = 5000;
    let data = "";

    while (tries > 0) {

        const fetchPromise = fetch(url, {headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"}});
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), timeout);
        })

        try {
            const response = await Promise.race([
                fetchPromise, timeoutPromise
            ]);

            // @ts-ignore
            if (!response.ok) {
                // @ts-ignore
                throw new Error(`HTTP error: ${response.status}`);
            }

            // @ts-ignore
            data = await response.text();
            break;
        } catch (error) {
            // @ts-ignore
            console.error(`Attempt failed: ${error.message}`);
            tries--;
            timeout += 5000;
        }
    }

    return data;
}


async function main() {
    const {question, input, msg} = await getTask("scraper");

    const article = await fetchText(input);
    console.log(article)

    const formattedChatPrompt = await chatPrompt.formatMessages({
        msg,
        article,
        question,
    });

    const {content} = await chat.call(formattedChatPrompt);
    console.log("content: " + JSON.stringify(content));

    await answer(content);
}

main();
import {ChatPromptTemplate} from "langchain/prompts";
import {answer, getTask} from "../utils/utils.ts";
import {ChatOpenAI, type OpenAIChatInput} from "@langchain/openai"

const systemTemplate = `
Jesteś specjalistą od pizzy i blogger piszesz wpis o pizzy. Podany temat jest fragmentem tego wpisu, 
zatem to co napiszesz jest fragmentem większej całości która składa się z tematów:

{topics}
`;

const humanTemplate = `Napisz kilka zdań na temat: {this_topic}`;


const taskData = await getTask('blogger')

    const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate]
]);

const topics = taskData.blog.join("; ");

// @ts-ignore
const promises = taskData.blog.map(async this_topic => {
    const formattedChatPrompt = await chatPrompt.formatMessages({
        topics,
        this_topic,
    });

    const chat = new ChatOpenAI<OpenAIChatInput>({openAIApiKey: process.env.OPENAI_API_KEY, maxTokens: 2000});
// @ts-ignore
    const {content} = await chat.invoke(formattedChatPrompt);

    return content
});
const results = await Promise.all(promises);
console.log("results: " + JSON.stringify(results))
answer(results)

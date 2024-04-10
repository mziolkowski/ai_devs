import {answer, getTask} from "../utils/utils.ts";
import {QdrantClient} from "@qdrant/js-client-rest";
import {ChatOpenAI, OpenAIChat, OpenAIEmbeddings} from "@langchain/openai";
import fetch from "node-fetch";
import * as fs from "fs";
import {Document} from "langchain/document";
import {v4 as uuidv4} from "uuid";
import {ChatPromptTemplate} from "langchain/prompts";

const COLLECTION_NAME = "ai_devs_2_people_mz";

// struktura danych otrzymanych z adresuURL
interface SourceData {
    imie: string,
    nazwisko: string,
    wiek: number,
    o_mnie: string,
    ulubiona_postac_z_kapitana_bomby: string,
    ulubiony_serial: string,
    ulubiony_film: string,
    ulubiony_kolor: string,

}

// format danych do bazy wektorowej Qdrant
interface NewData {
    name: string;
    about: string;
    uuid?: string
}

// struktura Qdrant
interface Points {
    id: any;
    vector: number[];
    payload: any;
}

const systemTemplate = `Your task is to find the answer to the question submitted. Just answer the question and do nothing else. The answer should be brief.
###CONTEXT:
Jestem {name}, {about}
`

const humanTemplate = `Question: {question}`;

const formatOfQuestionSystemTemplate = `Jesteś korektorem. 
Zwróć imię i nazwisko w mianowniku z podanego zdania i nic więcej.`

const {data, question} = await getTask("people");

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Wykonanie odmiany imienia i nazwiska do formatu mianownika, zeby precyzyjniej przeszukać bazę danych.
const model = new ChatOpenAI({openAIApiKey: process.env.OPENAI_API_KEY});
const prevChatPrompt = ChatPromptTemplate.fromMessages([
    ["system", formatOfQuestionSystemTemplate],
    ["human", question]
]);

// @ts-ignore
const prevFormattedChatPrompt = await prevChatPrompt.formatMessages({});
// @ts-ignore
const formattedQuestion = await model.invoke(prevFormattedChatPrompt);
// console.log(formattedQuestion.content);
//////////////////////////////////////////////////////////////////////////////////////////////////////////

const qdrant = new QdrantClient({url: process.env.QDRANT_URL});
const url = data;
const embeddings = new OpenAIEmbeddings(({maxConcurrency: 5, openAIApiKey: process.env.OPENAI_API_KEY}));
// @ts-ignore
const questionEmbedding = await embeddings.embedQuery(formattedQuestion.content);
const result = await qdrant.getCollections();
const indexed = result.collections.find((collection) => collection.name === COLLECTION_NAME);
// console.log(result)

if (!indexed) {
    await qdrant.createCollection(COLLECTION_NAME, {vectors: {size: 1536, distance: "Cosine", on_disk: true}});
}

const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);

if (!collectionInfo.points_count) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    // @ts-ignore
    let newData: NewData[] = JSON.parse(processData(json));

    const points: Points[] = [];

    // @ts-ignore
    for (const data of newData) {
        // @ts-ignore
        const [embedding] = await embeddings.embedDocuments([data.name]);
        points.push({
            id: data.uuid,
            payload: {
                name: data.name,
                about: data.about
            },
            vector: embedding
        })
    }

    await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        batch: {
            ids: points.map((point) => (point.id)),
            vectors: points.map((point) => (point.vector)),
            payloads: points.map((point) => (point.payload)),
        },
    })

    function processData(data: SourceData[]) {
        let res: NewData[] = [];
        for (const person of data) {
            let name = `${person.imie} ${person.nazwisko}`;
            let about = `${person.o_mnie}, ulubiona_postac_z_kapitana_bomby ${person.ulubiona_postac_z_kapitana_bomby}, ulubiony_serial ${person.ulubiony_serial}, ulubiony_film ${person.ulubiony_film}, ulubiony_kolor ${person.ulubiony_kolor}`;
            res.push({
                name: name,
                about: about,
                uuid: uuidv4()
            })
        }
        return JSON.stringify(res, null, 2)
    }
}

const search = await qdrant.search(COLLECTION_NAME, {
    vector: questionEmbedding,
    limit: 1,
});

console.log(search)

const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", humanTemplate]
]);
// @ts-ignore
const about = search[0].payload.about;
// @ts-ignore
const name = search[0].payload.name;
const formattedChatPrompt = await chatPrompt.formatMessages({
    question,
    about,
    name
});

// @ts-ignore
const {content} = await model.invoke(formattedChatPrompt);
console.log(content);

answer(content)




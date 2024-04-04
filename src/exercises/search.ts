import {answer, getTask} from "../utils/utils.ts";
import {QdrantClient} from '@qdrant/js-client-rest';
import {OpenAIEmbeddings} from "@langchain/openai";
import {v4 as uuidv4} from 'uuid';
import fetch from "node-fetch";
import * as fs from "fs";
import {Document} from "langchain/document";

const COLLECTION_NAME = "ai_devs_2";
const TEXT_FILE_NAME = "unknowNews.json";

interface NewDocument {
    title: string;
    url: string;
    uuid?: string;
}

interface Points {
    id: any;
    vector: number[];
    payload: any;
}

const {msg, question} = await getTask("search")

const qdrant = new QdrantClient({url: process.env.QDRANT_URL});
const pattern = /https?:\/\/\S+/;
const url = msg.match(pattern);
const embeddings = new OpenAIEmbeddings({maxConcurrency: 5, openAIApiKey: process.env.OPENAI_API_KEY})
const questionEmbedding = await embeddings.embedQuery(question);
const result = await qdrant.getCollections();
const indexed = result.collections.find((collection) => collection.name === COLLECTION_NAME);
console.log(result)

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
    fs.writeFileSync(TEXT_FILE_NAME, JSON.stringify(json))

    // @ts-ignore
    let documents: NewDocument[] = readJsonFile(TEXT_FILE_NAME);

    // @ts-ignore
    documents.forEach(doc => {
        doc.uuid = uuidv4()
    })
    const points: Points[] = [];

    // @ts-ignore
    for (const document of documents) {
        // @ts-ignore
        const [embedding] = await embeddings.embedDocuments([document.title]);
        points.push({
            id: document.uuid,
            payload: {
                title: document.title,
                url: document.url,
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

    function readJsonFile(filePath: string): Document[] {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as Document[];
    }
}

const search = await qdrant.search(COLLECTION_NAME, {
    vector: questionEmbedding,
    limit: 1,
});

console.log(search)
// @ts-ignore
answer(search[0].payload.url);

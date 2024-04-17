import {answer, getTask} from "../utils/utils.ts";
import express from "express";
import OpenAI from "openai";
const { getJson } = require("serpapi");

const app = express();
const port = 3034;
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.use(express.json());

// @ts-ignore
app.get("/api/", (req, res) => {
    res.send("Hello Mikr.us!");
});


// @ts-ignore
app.post("/api/", async (req, res) => {
    console.log("question: ", req.body.question);

    const messages = [
        { "role": "system", "content": `Reformulate the user's message to a form in which it can be used in a Google search. 

Answer questions truthfully, using the context below and nothing else. If you don't know the answer, say "I don't know."
Speak as briefly and truthfully as possible, with correct grammar` },
        { "role": "user", "content": req.body.question },
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
    });

    const search =  response.choices[0].message.content;
    console.log("Search: ", response.choices[0].message.content);

    getJson({
        engine: "google",
        q: search,
        api_key: process.env.SERP_API_KEY
    }, (json) => {
        console.log(json["organic_results"][0].link);
        res.json({ "reply" : json["organic_results"][0].link });
    });

});

async function main() {
    const task = await getTask("google")

    console.log("starting server");
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });

    await answer("https://mziolkowski.ovh/api/");

}

main();
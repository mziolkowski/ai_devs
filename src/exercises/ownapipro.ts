import OpenAI from "openai";
import express from "express";
import {answer, getTask} from "../utils/utils.ts";

const app = express();
const port = 3034;
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const messages = [
    { "role": "system", "content": `
If this is something to remember, just acknowledge by "OK" and nothing more.
Do not use punctation in your answers. Answer as consciously as possible, using the same language as user, 
use one or two words if possible. ` },
];

app.use(express.json());

// @ts-ignore
app.get("/api/", (req, res) => {
    res.send("Hello Mikr.us!");
});

// @ts-ignore
app.post("/api/", async (req, res) => {
    console.log("question: ", req.body.question);

    messages.push({ "role": "user", "content": req.body.question })

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages
    });

    console.log("Responding with: ", response.choices[0].message.content);

    messages.push({ "role": "assistant", "content": response.choices[0].message.content })

    res.json({reply: response.choices[0].message.content});
});

async function main() {
    const data = await getTask("ownapipro");

    console.log("starting server");
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });

    await answer("https://mziolkowski.ovh/api/");

}

main();
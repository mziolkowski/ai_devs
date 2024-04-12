import {answer, getTask} from "../utils/utils.ts";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = 6060;
const openai = new OpenAI();

app.use(express.json());

// @ts-ignore
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// @ts-ignore
app.post("/", async (req, res) => {
    console.log("question: ", req.body.question);

    const messages = [
        { "role": "system", "content": "Answer as consciously as possible, using the same language as user, use one or two words if possible" },
        { "role": "user", "content": req.body.question },
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages
    });

    console.log("Responding with: ", response.choices[0].message.content);

    res.json({reply: response.choices[0].message.content});
});

async function main() {
    const data = await getTask("ownapi");

    console.log("starting server");
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });

    // await answer("https://aidevs.dulare.com/");

}

main();
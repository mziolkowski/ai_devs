import {answer, getTask} from "../utils/utils.ts";
import fetch from "node-fetch";

const {image, text} = await getTask("meme")

const response = await fetch("https://get.renderform.io/api/v2/render", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.RENDERFORM_API
    },
    body: JSON.stringify({
        "template": process.env.RENDERFORM_TEMPLATE_ID,
        "data": {
            "meme_img.src": image,
            "meme_text.text": text
        }
    })
})
const parsedRespse = await response.json();
console.log(parsedRespse)
answer(parsedRespse.href)
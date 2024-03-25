import {answer, getTask} from "../utils/utils.ts";

getTask('helloapi').then(data => {
    answer(data.cookie)
})
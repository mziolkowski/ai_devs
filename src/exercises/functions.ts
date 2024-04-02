import {answer, getTask} from "../utils/utils.ts";
import {taskShema} from "./shame.ts";

const task = await getTask("functions")
answer(taskShema)
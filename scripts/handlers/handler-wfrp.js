import {RollHandlerBaseWfrp} from "../rolls/base-wfrp-rolls.js"

export function getRollHandler(roller = "") {
    return new RollHandlerBaseWfrp();
}
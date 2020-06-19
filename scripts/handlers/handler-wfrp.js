import {RollHandlerBaseWfrp4e} from "../rolls/base-wfrp-rolls.js"

export function getRollHandler(rollHandler = "") {
    return new RollHandlerBaseWfrp4e();
}
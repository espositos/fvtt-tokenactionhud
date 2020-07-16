import {RollHandlerBaseSfrpg as Core} from "./sfrpg-base.js"

export function getRollHandler(rollHandler = "") {
    switch (rollHandler) {
        case "core":
            return new Core();
        default:
            return new Core();
    }
}
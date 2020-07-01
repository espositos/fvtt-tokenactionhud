import {RollHandlerBaseDw as Core} from "./dw-base.js"

export function getRollHandler(rollHandler = "") {
    switch (rollHandler) {
        case "core":
            return new Core();
        default:
            return new Core();
    }
}
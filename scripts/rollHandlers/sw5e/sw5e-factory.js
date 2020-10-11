import {RollHandlerBaseSw5e as Core} from "./sw5e-base.js"

export function getRollHandler(rollHandler = "") {
    switch (rollHandler) {
        case "core":
            return new Core();
        default:
            return new Core();
    }
}
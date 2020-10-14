import { RollHandlerBaseDemonlord } from "./demonlord-base.js"

export function getRollHandler(rollHandler = "") {
    return new RollHandlerBaseDemonlord();
}
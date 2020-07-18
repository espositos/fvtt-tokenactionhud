import {RollHandlerBase5e as Core} from "./dnd5e-base.js"
import {RollHandlerBetterRolls5e as BetterRolls5e} from "./dnd5e-betterrolls5e.js"
import {RollHandlerMinorQol5e as MinorQol5e} from "./dnd5e-minorqol.js"
import { HandlersManager } from "../../handlersManager.js";
import { MagicItemsPreRollHandler } from "./magicItemsPreRollHandler.js";

export function getRollHandler(rollHandler = "") {
    let handler;
    switch (rollHandler) {
        case "betterrolls5e":
            handler = new BetterRolls5e();
            break;
        case "minor-qol":
            handler = new MinorQol5e();
            break;
        case "core":
        default:
            handler = new Core();
            break;
    }

    if (HandlersManager.isModuleActive('magicitems'))
        handler.addPreRollHandler(new MagicItemsPreRollHandler());

    return handler;
}
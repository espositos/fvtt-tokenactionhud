import {RollHandlerBaseSfrpg as Core} from "./sfrpg-base.js"
//import {RollHandlerBetterRolls5e as BetterRolls5e} from "./dnd5e-betterrolls5e.js"
//import {RollHandlerMinorQol5e as MinorQol5e} from "./dnd5e-minorqol.js"

export function getRollHandler(rollHandler = "") {
    switch (rollHandler) {
        /*
        case "betterrolls5e":
            return new BetterRolls5e();
        case "minor-qol":
            return new MinorQol5e();
            */
        case "core":
            return new Core();
        default:
            return new Core();
    }
}
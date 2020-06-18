import {RollHandlerBase5e as Core} from "../rolls/base-dnd5e-rolls.js"
import {RollHandlerBetterRolls5e as BetterRolls5e} from "../rolls/betterrolls5e-dnd5e-rolls.js"

static function getRollHandler(roller = "") {
    switch (roller) {
        case "betterrolls5e":
            return new BetterRolls5e();
        case "core":
        default:
            return Core();
    }
}
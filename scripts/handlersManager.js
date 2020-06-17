import { ActionHandler5e } from "./actions/actions-dnd5e.js";
import { ActionHandlerWfrp } from "./actions/actions-wfrp.js";
import { ActionHandler5e }from "./actions/actions-dnd5e.js";
import { RollHandlerWfrp } from "./handlers/handler-wfrp.js";
import { RollHandler5e } from "./handlers/handler-dnd5e.js";

export class HandlersManager {
    // Currently only planning for one kind of action handler for each system
    static getActionHandler(system) {
        switch (system) {
            case "wfrp4e":
                return new ActionHandlerWfrp();
            case "dnd5e":
                return new ActionHandler5e();
        }
        throw new Error("System not supported by TokenActionHUD");
    }

    // Possibility for several types of rollers (e.g. BetterRolls, MinorQOL for DND5e),
    // so pass off to a RollHandler factory
    static getRollHandler(system) {
        switch (system) {
            case "wfrp4e":
                return RollHandlerWfrp.getRollhandler("");
            case "dnd5e":
                return RollHandler5e.getRollHandler("")
        }
        throw new Error("System not supported by TokenActionHUD");
    }
}
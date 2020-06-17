import { ActionHandler5e } from "./actions/actions-dnd5e.js";
import { ActionHandlerWfrp } from "./actions/actions-wfrp.js";
import { ResourceBuilder5e } from "./resources/resources-dnd5e.js";
import { RollHandlerBase5e }from "./rolls/base-dnd5e-rolls.js";
import { RollHandlerBaseWfrp } from "./rolls/base-wfrp-rolls.js";

export class HandlersFactory {
    static getActionHandler(system) {
        switch (system) {
            case "wfrp4e":
                return new ActionHandlerWfrp();
            case "dnd5e":
                return new ActionHandler5e();
        }
        throw new Error("System not supported by TokenActionHUD");
    }

    static getRollHandler(system) {
        switch (system) {
            case "wfrp4e":
                return new RollHandlerBaseWfrp();
            case "dnd5e":
                return new RollHandlerBase5e();
        }
        throw new Error("System not supported by TokenActionHUD");
    }
}
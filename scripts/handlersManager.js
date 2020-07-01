import { ActionHandler5e } from "./actions/dnd5e/dnd5e-actions.js";
import { ActionHandlerWfrp } from "./actions/wfrp4e/wfrp4e-actions.js";
import { ActionHandlerPf2e } from "./actions/pf2e/pf2e-actions.js";
import * as roll5e from "./rollHandlers/dnd5e/dnd5e-factory.js";
import * as rollWfrp from "./rollHandlers/wfrp4e/wfrp4e-factory.js";
import * as rollPf2e from "./rollHandlers/pf2e/pf2e-factory.js";

export class HandlersManager {
    // Currently only planning for one kind of action handler for each system
    static getActionHandler(system) {
        switch (system) {
            case "dnd5e":
                return new ActionHandler5e();
            case "pf2e":
                return new ActionHandlerPf2e();
            case "wfrp4e":
                return new ActionHandlerWfrp();
        }
        throw new Error("System not supported by Token Action HUD");
    }

    // Possibility for several types of rollers (e.g. BetterRolls, MinorQOL for DND5e),
    // so pass off to a RollHandler factory
    static getRollHandler(system, handlerId) {
        switch (system) {
            case "dnd5e":
                return roll5e.getRollHandler(handlerId)
            case "pf2e":
                return rollPf2e.getRollHandler(handlerId);
            case "wfrp4e":
                return rollWfrp.getRollHandler(handlerId);
        }
        throw new Error("System not supported by Token Action HUD");
    }

    // Not yet implemented.
    static getRollHandlerChoices(system) {
        let choices;

        switch (system) {
            case "dnd5e":
                choices = {"core": "Core 5e"};
                this.testForModule(choices, "betterrolls5e");
                this.testForModule(choices, "minor-qol");
                break;
            case "pf2e":
                choices = {"core": "Core PF2E"};
                break;
            case "wfrp4e":
                choices = {"core": "Core Wfrp"};
                break;
        }

        return choices;
    }

    static testForModule(choices, id) {
        let module = game.modules.get(id);
        if (module && module.active) {
            let id = module.id;
            let title = module.data.title;
            mergeObject(choices, { [id]: title })
        }
    }
}
import { ActionHandler5e } from "./actions/actions-dnd5e.js";
import { ActionHandlerWfrp } from "./actions/actions-wfrp.js";
import { ActionHandlerPf2e } from "./actions/pf2e-actions.js";
import * as roll5e from "./handlers/handler-dnd5e.js";
import * as rollWfrp from "./handlers/handler-wfrp.js";
import * as rollPf2e from "./handlers/handler-pf2e.js";

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
            case "pf2e":
                choices = {"core": "Core PF2E"};
            case "wfrp4e":
                choices = {"core": "Core Wfrp"};
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
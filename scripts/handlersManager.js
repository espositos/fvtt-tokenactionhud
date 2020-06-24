import { ActionHandler5e } from "./actions/actions-dnd5e.js";
import { ActionHandlerWfrp } from "./actions/actions-wfrp.js";
import * as roll5e from "./handlers/handler-dnd5e.js";
import * as rollWfrp from "./handlers/handler-wfrp.js";

export class HandlersManager {
    // Currently only planning for one kind of action handler for each system
    static getActionHandler(system) {
        switch (system) {
            case "wfrp4e":
                return new ActionHandlerWfrp();
            case "dnd5e":
                return new ActionHandler5e();
        }
        throw new Error("System not supported by token-action-hud");
    }

    // Possibility for several types of rollers (e.g. BetterRolls, MinorQOL for DND5e),
    // so pass off to a RollHandler factory
    static getRollHandler(system, handlerId) {
        switch (system) {
            case "wfrp4e":
                return rollWfrp.getRollHandler(handlerId);
            case "dnd5e":
                return roll5e.getRollHandler(handlerId)
        }
        throw new Error("System not supported by token-action-hud");
    }

    // Not yet implemented.
    static getRollHandlerChoices(system) {
        switch (system) {
            case "wfrp4e":
                return {"core": "Core Wfrp"};
            case "dnd5e":
                let choices = {"core": "Core 5e"};
                this.testForModule(choices, "betterrolls5e");
                this.testForModule(choices, "minor-qol");
                return choices;
        }
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
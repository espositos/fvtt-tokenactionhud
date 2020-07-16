import { ActionHandler5e } from './actions/dnd5e/dnd5e-actions.js';
import { ActionHandlerWfrp } from './actions/wfrp4e/wfrp4e-actions.js';
import { ActionHandlerPf2e } from './actions/pf2e/pf2e-actions.js';
import { ActionHandlerDw } from './actions/dungeonworld/dw-actions.js';
import { ActionHandlerSfrpg } from './actions/sfrpg/sfrpg-actions.js';

import * as roll5e from './rollHandlers/dnd5e/dnd5e-factory.js';
import * as rollWfrp from './rollHandlers/wfrp4e/wfrp4e-factory.js';
import * as rollPf2e from './rollHandlers/pf2e/pf2e-factory.js';
import * as rollDw from './rollHandlers/dungeonworld/dw-factory.js';
import * as rollSf from './rollHandlers/sfrpg/sfrpg-factory.js';


export class HandlersManager {
    // Currently only planning for one kind of action handler for each system
    static getActionHandler(system, filterManager) {
        switch (system) {
            case 'dnd5e':
                return new ActionHandler5e(filterManager);
            case 'pf2e':
                return new ActionHandlerPf2e(filterManager);
            case 'wfrp4e':
                return new ActionHandlerWfrp(filterManager);
            case 'dungeonworld':
                return new ActionHandlerDw(filterManager);
            case 'sfrpg':
                return new ActionHandlerSfrpg(filterManager);
        }
        throw new Error('System not supported by Token Action HUD');
    }

    // Possibility for several types of rollers (e.g. BetterRolls, MinorQOL for DND5e),
    // so pass off to a RollHandler factory
    static getRollHandler(system, handlerId) {
        switch (system) {
            case 'dnd5e':
                return roll5e.getRollHandler(handlerId)
            case 'pf2e':
                return rollPf2e.getRollHandler(handlerId);
            case 'wfrp4e':
                return rollWfrp.getRollHandler(handlerId);
            case 'dungeonworld':
                return rollDw.getRollHandler(handlerId);
            case 'sfrpg':
                return rollSf.getRollHandler(handlerId);
        }
        throw new Error('System not supported by Token Action HUD');
    }

    // Not yet implemented.
    static getRollHandlerChoices(system) {
        let choices;

        switch (system) {
            case 'dnd5e':
                choices = {'core': 'Core 5e'};
                this.testForModule(choices, 'betterrolls5e');
                this.testForModule(choices, 'minor-qol');
                break;
            case 'pf2e':
                choices = {'core': 'Core PF2E'};
                break;
            case 'wfrp4e':
                choices = {'core': 'Core Wfrp'};
                break;
            case 'dungeonworld':
                choices = {'core': 'Core DungeonWorld'};
            case 'sfrpg':
                    choices = {'core': 'Core sfrpg'};
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
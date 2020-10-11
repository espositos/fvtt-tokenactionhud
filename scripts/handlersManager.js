import { ActionHandler5e } from './actions/dnd5e/dnd5e-actions.js';
import { MagicItemActionListExtender } from './actions/dnd5e/magicItemsExtender.js';
import { ItemMacroActionListExtender } from './actions/itemMacroExtender.js';
import { ActionHandlerWfrp } from './actions/wfrp4e/wfrp4e-actions.js';
import { ActionHandlerPf2e } from './actions/pf2e/pf2e-actions.js';
import { ActionHandlerDw } from './actions/dungeonworld/dw-actions.js';
import { ActionHandlerSfrpg } from './actions/sfrpg/sfrpg-actions.js';
import { ActionHandlerSw5e } from './actions/sw5e/sw5e-actions.js';
import { ActionHandlerPf1 } from './actions/pf1/pf1-actions.js';
import { CompendiumMacroPreHandler } from './rollHandlers/compendiumMacroPreHandler.js';

import * as roll5e from './rollHandlers/dnd5e/dnd5e-factory.js';
import * as rollWfrp from './rollHandlers/wfrp4e/wfrp4e-factory.js';
import * as rollPf2e from './rollHandlers/pf2e/pf2e-factory.js';
import * as rollDw from './rollHandlers/dungeonworld/dw-factory.js';
import * as rollSf from './rollHandlers/sfrpg/sfrpg-factory.js';
import * as rollSw from './rollHandlers/sw5e/sw5e-factory.js';
import * as rollPf1 from './rollHandlers/pf1/pf1-factory.js';
import { ItemMacroPreRollHandler } from './rollHandlers/pre-itemMacro.js';


export class HandlersManager {
    // Currently only planning for one kind of action handler for each system
    static getActionHandler(system, filterManager, categoryManager) {
        let handler;
        
        switch (system) {
            case 'dnd5e':
                handler = HandlersManager.getActionHandler5e(filterManager, categoryManager);
                break;
            case 'pf2e':
                handler = new ActionHandlerPf2e(filterManager, categoryManager);
                break;
            case 'wfrp4e':
                handler = new ActionHandlerWfrp(filterManager, categoryManager);
                break;
            case 'dungeonworld':
                handler = new ActionHandlerDw(filterManager, categoryManager);
                break;
            case 'sfrpg':
                handler = new ActionHandlerSfrpg(filterManager, categoryManager);
                break;
            case 'sw5e':
                handler = new ActionHandlerSw5e(filterManager, categoryManager);
                break;
            case 'pf1':
                handler = new ActionHandlerPf1(filterManager, categoryManager);
                break;
            default:
                throw new Error('System not supported by Token Action HUD');
        }

        if (HandlersManager.isModuleActive('itemacro'))
            handler.addFurtherActionHandler(new ItemMacroActionListExtender())

        return handler;
    }

    static getActionHandler5e(filterManager, categoryManager) {
        let actionHandler = new ActionHandler5e(filterManager, categoryManager);
        if (HandlersManager.isModuleActive('magicitems'))
            actionHandler.addFurtherActionHandler(new MagicItemActionListExtender())
        return actionHandler;
    }

    // Possibility for several types of rollers (e.g. BetterRolls, MinorQOL for DND5e),
    // so pass off to a RollHandler factory
    static getRollHandler(system, handlerId) {
        let handler;
        switch (system) {
            case 'dnd5e':
                handler = roll5e.getRollHandler(handlerId)
                break;
            case 'pf2e':
                handler =  rollPf2e.getRollHandler(handlerId);
                break;
            case 'wfrp4e':
                handler =  rollWfrp.getRollHandler(handlerId);
                break;
            case 'dungeonworld':
                handler =  rollDw.getRollHandler(handlerId);
                break;
            case 'sfrpg':
                handler =  rollSf.getRollHandler(handlerId);
                break;
            case 'sw5e':
                handler =  rollSw.getRollHandler(handlerId);
                break;
            case 'pf1':
                handler =  rollPf1.getRollHandler(handlerId);
                break;
        }

        handler.addPreRollHandler(new CompendiumMacroPreHandler())

        if (HandlersManager.isModuleActive('itemacro'))
            handler.addPreRollHandler(new ItemMacroPreRollHandler())

        return handler;
    }

    // Not yet implemented.
    static getRollHandlerChoices(system) {
        let choices;

        switch (system) {
            case 'dnd5e':
                let coreTitle = 'Core 5e';
                if (HandlersManager.isModuleActive('midi-qol'))
                    coreTitle += ` [supports ${HandlersManager.getModuleTitle('midi-qol')}]`;
                choices = {core: coreTitle};
                this.addModule(choices, 'betterrolls5e');
                this.addModule(choices, 'minor-qol');
                break;
            case 'pf2e':
                choices = {'core': 'Core PF2E'};
                break;
            case 'wfrp4e':
                choices = {'core': 'Core Wfrp'};
                break;
            case 'dungeonworld':
                choices = {'core': 'Core DungeonWorld'};
                break;
            case 'sfrpg':
                choices = {'core': 'Core Starfinder'};
                break;
            case 'sw5e':
                choices = {'core': 'Core Star Wars RPG'};
                break;
            case 'pf1':
                choices = {'core': 'Core PF1'};
                break;
        }

        return choices;
    }

    static addModule(choices, id) {
        if (HandlersManager.isModuleActive(id)) {
            let title = HandlersManager.getModuleTitle(id);
            mergeObject(choices, { [id]: title })
        }
    }

    static isModuleActive(id) {
        let module = game.modules.get(id);
        return module && module.active;
    }

    static getModuleTitle(id) {
        return game.modules.get(id)?.data.title ?? '';
    }
}
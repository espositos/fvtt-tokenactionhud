import { SystemManager } from './manager.js';
import { ActionHandler5e as ActionHandler } from '../actions/dnd5e/dnd5e-actions.js'; 
import { MagicItemsPreRollHandler } from '../rollHandlers/dnd5e/pre-magicItems.js';
import {RollHandlerBase5e as Core} from '../rollHandlers/dnd5e/dnd5e-base.js';
import {RollHandlerBetterRolls5e as BetterRolls5e} from '../rollHandlers/dnd5e/dnd5e-betterrolls5e.js';
import {RollHandlerMinorQol5e as MinorQol5e} from '../rollHandlers/dnd5e/dnd5e-minorqol.js';
import * as settings from '../settings/dnd5e-settings.js';

export class Dnd5eSystemManager extends SystemManager {

    constructor(appName) {
        super(appName);
    }

    /** @override */
    doGetActionHandler(filterManager, categoryManager) {
        let actionHandler = new ActionHandler(filterManager, categoryManager);
        return actionHandler;
    }

    /** @override */
    getAvailableRollHandlers() {
        let coreTitle = 'Core D&D5e';

        if (SystemManager.isModuleActive('midi-qol'))
            coreTitle += ` [supports ${SystemManager.getModuleTitle('midi-qol')}]`;

        let choices = { core: coreTitle };
        SystemManager.addHandler(choices, 'betterrolls5e');
        SystemManager.addHandler(choices, 'minor-qol');

        return choices;
    }

    /** @override */
    doGetRollHandler(handlerId) {
        switch (handlerId) {
            case 'betterrolls5e':
                handler = new BetterRolls5e();
                break;
            case 'minor-qol':
                handler = new MinorQol5e();
                break;
            case "core":
            default:
                handler = new Core();
                break;
        }
        
        if (SystemManager.isModuleActive('magicitems'))
            handler.addPreRollHandler(new MagicItemsPreRollHandler());

        return handler;
    }

    /** @override */
    doRegisterSettings(appName, updateFunc) {
        settings.register(appName, updateFunc);
    }
}
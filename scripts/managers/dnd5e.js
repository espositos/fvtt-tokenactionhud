import { SystemManager } from './manager.js';
import { ActionHandler5e } from '../actions/dnd5e/dnd5e-actions.js'; 
import {MagicItemsPreRollHandler} from '../rollHandlers/dnd5e/pre-magicItems.js';
import * as roll from '../rollHandlers/dnd5e/dnd5e-factory.js';
import * as settings from '../settings/dnd5e-settings.js'

export class Dnd5eSystemManager extends SystemManager {
    appName;

    constructor(appName) {
        super(appName);
        this.appName = appName;
    }

    /** @override */
    doGetActionHandler(filterManager, categoryManager) {
        let actionHandler = new ActionHandler5e(filterManager, categoryManager);
        return actionHandler;
    }

    /** @override */
    getAvailableRollHandlers() {
        let coreTitle = 'Core 5e';

        if (SystemManager.isModuleActive('midi-qol'))
            coreTitle += ` [supports ${SystemManager.getModuleTitle('midi-qol')}]`;

        let choices = { core: coreTitle };
        SystemManager.addHandler(choices, 'betterrolls5e');
        SystemManager.addHandler(choices, 'minor-qol');

        return choices;
    }

    /** @override */
    doGetRollHandler(handlerId) {
        let handler = roll.getRollHandler(handlerId)
        
        if (SystemManager.isModuleActive('magicitems'))
            handler.addPreRollHandler(new MagicItemsPreRollHandler());

        return handler;
    }

    /** @override */
    doRegisterSettings(appName, updateFunc) {
        settings.register(appName, updateFunc);
    }
}
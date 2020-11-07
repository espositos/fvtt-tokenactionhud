import { SystemManager } from './manager.js';
import { ActionHandlerDw as ActionHandler } from '../actions/dungeonworld/dw-actions.js'
import * as roll from '../rollHandlers/dungeonworld/dw-factory.js';
import * as settings from '../settings/dungeonworld-settings.js'

export class Pf2eSystemManager extends SystemManager {
    
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
        let choices = { 'core': 'Core DungeonWorld' };

        return choices;
    }

    /** @override */
    doGetRollHandler(handlerId) {
        let handler = roll.getRollHandler(handlerId)

        return handler;
    }

    /** @override */
    doRegisterSettings(appName, updateFunc) {
        settings.register(appName, updateFunc);
    }
}
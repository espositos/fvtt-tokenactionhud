import { SystemManager } from './manager.js';
import { ActionHandlerSfrpg as ActionHandler } from '../actions/sfrpg/sfrpg-actions.js'
import * as roll from '../rollHandlers/sfrpg/sfrpg-factory.js';
import * as settings from '../settings/sfrpg-settings.js'

export class SfrpgSystemManager extends SystemManager {
    
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
        let choices = { 'core': 'Core Starfinder' };

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
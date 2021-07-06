import { SystemManager } from './manager.js';
import { ActionHandlerKg as ActionHandler } from '../actions/kamigakari/kg-actions.js'
import { RollHandlerBaseKg as Core } from '../rollHandlers/kamigakari/kg-base.js';
import * as settings from '../settings/kamigakari-settings.js'

export class KamigakariSystemManager extends SystemManager {
    
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
        let choices = { 'core': 'Core Kamigakari' };

        return choices;
    }

    /** @override */
    doGetRollHandler(handlerId) {
        return new Core();
    }

    /** @override */
    doRegisterSettings(appName, updateFunc) {
        settings.register(appName, updateFunc);
    }
}

import { SystemManager } from './manager.js';
import { ActionHandlerWfrp as ActionHandler } from '../actions/wfrp4e/wfrp4e-actions.js';
import { RollHandlerBaseWfrp4e as Core } from '../rollHandlers/wfrp4e/wfrp-base.js';
import * as settings from '../settings/wfrp4e-settings.js'

export class Wfrp4eSystemManager extends SystemManager {
    
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
        let choices = { 'core': 'Core WFRP4e' };

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
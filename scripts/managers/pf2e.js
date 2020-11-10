import { SystemManager } from './manager.js';
import { ActionHandlerPf2e as ActionHandler } from '../actions/pf2e/pf2e-actions.js';
import { RollHandlerBasePf2e as Core} from '../rollHandlers/pf2e/pf2e-base.js';
import * as settings from '../settings/pf2e-settings.js'

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
        let choices = { 'core': 'Core PF2E' };

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
import { SystemManager } from './manager.js';
import { ActionHandlerPf1 as ActionHandler } from '../actions/pf1/pf1-actions.js';
import { RollHandlerBasePf1 as Core} from '../rollHandlers/pf1/pf1-base.js';
import * as settings from '../settings/pf1-settings.js';

export class Pf1SystemManager extends SystemManager {

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
        let choices = { 'core': 'Core PF1' };

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
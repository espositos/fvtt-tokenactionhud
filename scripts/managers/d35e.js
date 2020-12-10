import { SystemManager } from './manager.js';
import { ActionHandlerD35E as ActionHandler } from '../actions/d35e/d35e-actions.js';
import { RollHandlerBaseD35E as Core} from '../rollHandlers/d35e/d35e-base.js';
import * as settings from '../settings/d35e-settings.js';

export class D35ESystemManager extends SystemManager {

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
        let choices = { 'core': 'Core D35E' };

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
import { SystemManager } from './manager.js';
import { ActionHandlerOD6S as ActionHandler } from '../actions/od6s/od6s-actions.js';
import { RollHandlerCoreOD6S as Core} from '../rollHandlers/od6s/od6s-base.js';
import * as settings from '../settings/od6s-settings.js';

export class OD6SSystemManager extends SystemManager {

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
        let choices = { 'core': 'Core OD6S' };

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
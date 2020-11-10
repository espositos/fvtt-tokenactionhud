import { SystemManager } from './manager.js';
import { ActionHandlerDemonlord as ActionHandler } from '../actions/demonlord/demonlord-actions.js'
import { RollHandlerBaseDemonlord as Core } from '../rollHandlers/demonlord/demonlord-base.js';
import * as settings from '../settings/demonlord-settings.js'

export class DemonlordSystemManager extends SystemManager {

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
        let choices = { 'core': 'Core Demonlord' };

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
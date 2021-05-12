import { SystemManager } from './manager.js';
import { ActionHandlerAlienrpg as ActionHandler } from '../actions/alienrpg/alienrpg-actions.js'
import { RollHandlerBaseAlienrpg as Core } from '../rollHandlers/alienrpg/alienrpg-base.js';
import * as settings from '../settings/alienrpg-settings.js'

export class AlienrpgSystemManager extends SystemManager {

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
        let choices = { 'core': 'Core AlienRPG' };

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
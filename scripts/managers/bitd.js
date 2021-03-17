import { SystemManager } from './manager.js';
import { ActionHandlerBitD as ActionHandler } from '../actions/bitd/bitd-actions.js';
import { RollHandlerBaseBitD as Core } from '../rollHandlers/bitd/bitd-base.js';
import * as settings from '../settings/bitd-settings.js'

export class BitDSystemManager extends SystemManager {
    
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
        let choices = { 'core': 'Core BitD' };

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
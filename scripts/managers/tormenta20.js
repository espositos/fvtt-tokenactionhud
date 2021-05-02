import { SystemManager } from './manager.js';
import { ActionHandlerT20 as ActionHandler } from '../actions/tormenta20/tormenta20-actions.js'; 
import { RollHandlerBaseT20 as Core } from '../rollHandlers/tormenta20/tormenta20-base.js';
// import * as settings from '../settings/tormenta20-settings.js';

export class Tormenta20SystemManager extends SystemManager {

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
        let coreTitle = 'Tormenta20';

        let choices = { core: coreTitle };

        return choices;
    }

    /** @override */
    doGetRollHandler(handlerId) {
        let rollHandler;
        switch (handlerId) {
            case 'core':
            default:
                rollHandler = new Core();
                break;
        }

        return rollHandler;
    }

    /** @override */
    doRegisterSettings(appName, updateFunc) {
        // settings.register(appName, updateFunc);
    }
}
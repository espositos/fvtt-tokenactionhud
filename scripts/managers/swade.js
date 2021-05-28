import { SystemManager } from "./manager.js";
import { ActionHandlerSwade as ActionHandler } from "../actions/swade/swade-actions.js"
import { RollHandlerBaseSwade as Core } from "../rollHandlers/swade/swade-base.js"
import { RollHandlerBR2SWSwade as BR2SW } from "../rollHandlers/swade/swade-br2sw.js"
import * as settings from '../settings/swade-settings.js';

export class SwadeSystemManager extends SystemManager {

    constructor(appName) {
        super(appName);
    }

    /** @override */
    doGetActionHandler(filterManager, categoryManager) {
        return new ActionHandler(filterManager, categoryManager);
    }

    /** @override */
    getAvailableRollHandlers() {
        let choices = { 'core': 'Core SWADE' };
        SystemManager.addHandler(choices, 'betterrolls-swade2');

        return choices;
    }

    /** @override */
    doGetRollHandler(handlerId) {
        switch (handlerId) {
            case 'betterrolls-swade2':
                return new BR2SW();
            default:
                return new Core();
        }
    }

    /** @override */
    doRegisterSettings(appName, updateFunc) {
        settings.register(appName, updateFunc);
    }
}

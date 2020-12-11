import { SystemManager } from "./manager.js";
import { ActionHandlerSwade as ActionHandler } from "../actions/swade/swade-actions.js"
import { RollHandlerBaseSwade as Core } from "../rollHandlers/swade/swade-base.js"
import * as settings from '../settings/swade-settings.js';

export class SwadeSystemManager extends SystemManager {

    constructor(appName) {
        super(appName);
    }

    /** @override */
    doGetActionHandler(filterManager, categoryManager) {
        console.log("startup");
        let actionHandler = new ActionHandler(filterManager, categoryManager);
        return actionHandler;
    }

    /** @override */
    getAvailableRollHandlers() {
        let choices = { 'core': 'Core SWADE' };

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
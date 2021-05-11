import { SystemManager } from "./manager.js";
import { ActionHandlerCthack as ActionHandler } from "../actions/cthack/cthack-actions.js"
import { RollHandlerBaseCthack as Core } from "../rollHandlers/cthack/cthack-base.js"
import * as settings from '../settings/cthack-settings.js';

export class CthackSystemManager extends SystemManager {

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
        let choices = { 'core': 'Core Cthack' };

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
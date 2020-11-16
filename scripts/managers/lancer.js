import { SystemManager } from "./manager.js";
import { ActionHandlerLancer as ActionHandler } from "../actions/lancer/lancer-actions.js"
import { RollHandlerBaseLancer as Core } from "../rollHandlers/lancer/lancer-base.js"
import * as settings from '../settings/lancer-settings.js';

export class LancerSystemManager extends SystemManager {

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
        let choices = { 'core': 'Core Lancer' };

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
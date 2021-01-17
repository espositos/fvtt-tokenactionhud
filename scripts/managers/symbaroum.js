import { SystemManager } from "./manager.js";
import { ActionHandlerSymbaroum as ActionHandler } from "../actions/symbaroum/symbaroum-actions.js"
import { RollHandlerBaseSymbaroum as Core } from "../rollHandlers/symbaroum/symbaroum-base.js"
import * as settings from '../settings/symbaroum-settings.js';

export class SymbaroumSystemManager extends SystemManager {

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
        let choices = { 'core': 'Core Symbaroum' };

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
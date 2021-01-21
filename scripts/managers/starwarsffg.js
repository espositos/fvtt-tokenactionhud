import { SystemManager } from "./manager.js";
import { ActionHandlerStarWarsFFG as ActionHandler } from "../actions/starwarsffg/starwarsffg-actions.js"
import { RollHandlerBaseStarWarsFFG as Core } from "../rollHandlers/starwarsffg/starwarsffg-base.js"
import * as settings from '../settings/starwarsffg-settings.js';

export class StarWarsFFGSystemManager extends SystemManager {

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
        let choices = { 'core': 'Core starwarsffg' };
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
import * as settings from '../settings.js';
import {Logger} from '../logger.js';
import {FilterManager} from '../actions/filter/filterManager.js';
import {CategoryManager} from '../actions/categories/categoryManager.js';
import {ItemMacroActionListExtender} from '../actions/itemMacroExtender.js';
import {CompendiumMacroPreHandler} from '../rollHandlers/compendiumMacroPreHandler.js';
import {ItemMacroPreRollHandler} from '../rollHandlers/pre-itemMacro.js';

export class SystemManager {

    i18n = (toTranslate) => game.i18n.localize(toTranslate);

    appName;
    constructor(appName) {
        this.appName = appName;
    }


    /** ACTION HANDLERS */

    async getActionHandler(user) {
        this.filterManager = new FilterManager(user);
        this.categoryManager = new CategoryManager(user, this.filterManager);

        await this.categoryManager.init();

        let actionHandler = this.doGetActionHandler(this.filterManager, this.categoryManager);
        this.addActionExtenders(actionHandler);
        return actionHandler;
    }

    doGetActionHandler() {}

    addActionExtenders(actionHandler) {
        if (SystemManager.isModuleActive('itemacro'))
            actionHandler.addFurtherActionHandler(new ItemMacroActionListExtender())
    }
    
    filterManager;
    getFilterManager() {
        return this.filterManager;
    }
    
    categoryManager;
    getCategoryManager() {
        return this.categoryManager;
    }


    /** ROLL HANDLERS */

    getRollHandler() {
        let rollHandlerId = settings.get('rollHandler');
        
        if (! (rollHandlerId === 'core' || SystemManager.isModuleActive(rollHandlerId)) ) {
            Logger.error(rollHandlerId, this.i18n('tokenactionhud.handlerNotFound'));
            rollHandlerId = 'core';
            settings.set('rollHandler', rollHandlerId);
        }

        let rollHandler = this.doGetRollHandler(rollHandlerId);
        this.addPreHandlers(rollHandler);
        return rollHandler;
    }

    doGetRollHandler(handlerId) {}

    addPreHandlers(rollHandler) {
        rollHandler.addPreRollHandler(new CompendiumMacroPreHandler())

        if (SystemManager.isModuleActive('itemacro'))
            rollHandler.addPreRollHandler(new ItemMacroPreRollHandler())
    }

    getAvailableRollHandlers() {}


    /** SETTINGS */

    registerSettings() {
        let rollHandlers = this.getAvailableRollHandlers();
        settings.registerSettings(this.appName, this, rollHandlers)
    }


    /** UTILITY */
    
    static addHandler(choices, id) {
        if (SystemManager.isModuleActive(id)) {
            let title = SystemManager.getModuleTitle(id);
            mergeObject(choices, { [id]: title })
        }
    }

    static isModuleActive(id) {
        let module = game.modules.get(id);
        return module && module.active;
    }

    static getModuleTitle(id) {
        return game.modules.get(id)?.data.title ?? '';
    }
}
import * as settings from '../settings.js';
import {Logger} from '../logger.js';
import {FilterManager} from '../actions/filter/filterManager.js';
import {CategoryManager} from '../actions/categories/categoryManager.js';
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

        let handler = this.doGetActionHandler(this.filterManager, this.categoryManager);
        this.addActionExtenders(handler);
        return handler;
    }

    doGetActionHandler() {}

    addActionExtenders(handler) {
        if (SystemManager.isModuleActive('itemacro'))
            handler.addFurtherActionHandler(new ItemMacroActionListExtender())
            
        if (SystemManager.isModuleActive('magicitems'))
            actionHandler.addFurtherActionHandler(new MagicItemActionListExtender())
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
        let handlerId = settings.get('rollHandler');
        
        if (! (handlerId === 'core' || SystemManager.isModuleActive(handlerId)) ) {
            Logger.error(handlerId, this.i18n('tokenactionhud.handlerNotFound'));
            handlerId = 'core';
            settings.set('rollHandler', handlerId);
        }

        let handler = this.doGetRollHandler(handlerId);
        this.addPreHandlers(handler);
        return handler;
    }

    doGetRollHandler(handlerId) {}

    addPreHandlers(handler) {
        handler.addPreRollHandler(new CompendiumMacroPreHandler())

        if (SystemManager.isModuleActive('itemacro'))
            handler.addPreRollHandler(new ItemMacroPreRollHandler())
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
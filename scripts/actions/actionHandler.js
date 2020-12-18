import {ActionList} from './entities/actionList.js';
import {ActionCategory} from './entities/actionCategory.js';
import {ActionSubcategory} from './entities/actionSubcategory.js';
import {ActionSet} from './entities/actionSet.js';
import {Action} from './entities/action.js';
import * as settings from '../settings.js';
import { GenericActionHandler } from './genericActionHandler.js';

export class ActionHandler {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    
    linkedCompendiumsGm = [];
    linkedCompendiumsPlayer = [];
    furtherActionHandlers = [];
    delimiter = '|';

    filterManager = null;

    constructor(filterManager, categoryManager) {
        this.filterManager = filterManager;
        this.categoryManager = categoryManager;
        this.genericActionHandler = new GenericActionHandler(this);
    }

    /** @public */
    async registerCoreCategories(categories) {
        await this.categoryManager.addCoreCategories(categories);
    }

    /** @public */
    async buildActionList(token, multipleTokens) {
        let actionList = await this.doBuildActionList(token, multipleTokens);
        this._addGenericCategories(token, actionList, multipleTokens);
        this._doBuildFurtherActions(token, actionList, multipleTokens);
        await this.registerCoreCategories(actionList.categories);
        await this.categoryManager.addCategoriesToActionList(this, actionList);
        return actionList;
    }

    /** @public */
    doBuildActionList(token) {};

    /** @protected */
    _addGenericCategories(token, actionList, multipleTokens) {
        if (token || multipleTokens)
            this.genericActionHandler.addGenericCategories(token, actionList, multipleTokens);
    }

    /** @protected */
    _doBuildFurtherActions(token, actionList, multipleTokens) {
        this.furtherActionHandlers.forEach(handler => handler.extendActionList(actionList, multipleTokens))
    }

    /** @public */
    addFurtherActionHandler(handler) {
        settings.Logger.debug(`Adding further action handler: ${handler.constructor.name}`)
        this.furtherActionHandlers.push(handler);
    }

    /** @public */
    initializeEmptyActionList() {
        return new ActionList();
    }

    /** @public */
    initializeEmptyActionSet() {
        return new ActionSet();
    }

    /** @public */
    initializeEmptyAction() {
        return new Action();
    }

    /** @public */
    initializeEmptyCategory(categoryId) {
        let category = new ActionCategory();
        category.id = categoryId;
        return category;
    }

    initializeEmptySubcategory(id = '') {
        let subcategory = new ActionSubcategory();
        subcategory.id = id;
        return subcategory;
    }

    /** @protected */
    _combineCategoryWithList(result, categoryName, category, push = true) {
        if (!category)
            return;

        if (category.subcategories.length === 0 && (category.core || category.core === undefined))
            return;

        if (categoryName?.length > 0)
            category.name = categoryName;

        if (push)
            result.categories.push(category);
        else
            result.categories.unshift(category);
    }

    /** @protected */
    _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
        if (!subcategory)
            return;
            
        if (subcategoryName?.length > 0)
            subcategory.name = subcategoryName;
        
        if (subcategory.subcategories.length > 0 || subcategory.actions.length > 0 || subcategory.canFilter)
            category.subcategories.push(subcategory);
        else
            settings.Logger.debug('subcategory criteria not met, disposing of', subcategoryName)
    }

    /** @protected */
    _foundrySort(a, b) {
        if (!(a?.data?.sort || b?.data?.sort))
            return 0;

        return a.data.sort - b.data.sort;
    }
}
import {ActionList} from './entities/actionList.js';
import {ActionCategory} from './entities/actionCategory.js';
import {ActionSubcategory} from './entities/actionSubcategory.js';
import {ActionSet} from './entities/actionSet.js';
import {Action} from './entities/action.js';
import * as settings from '../settings.js';

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
    }

    registerCoreCategories(categories) {
        this.categoryManager.addCoreCategories(categories);
    }

    async buildActionList(token, multipleTokens) {
        let actionList = await this.doBuildActionList(token, multipleTokens);
        this._doBuildFurtherActions(token, actionList);
        this.registerCoreCategories(actionList.categories);
        await this.categoryManager.addCategoriesToActionList(this, actionList);
        return actionList;
    }

    doBuildActionList(token) {};

    _doBuildFurtherActions(token, actionList) {
        this.furtherActionHandlers.forEach(handler => handler.extendActionList(actionList))
    }

    addFurtherActionHandler(handler) {
        this.furtherActionHandlers.push(handler);
    }

    initializeEmptyActionList() {
        return new ActionList();
    }

    initializeEmptyActionSet() {
        return new ActionSet();
    }

    initializeEmptyAction() {
        return new Action();
    }

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
}
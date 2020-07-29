import {ActionList} from './entities/actionList.js';
import {Category} from './entities/category.js';
import {Subcategory} from './entities/subcategory.js';

export class ActionHandler {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    
    linkedCompendiumsGm = [];
    linkedCompendiumsPlayer = [];
    furtherActionHandlers = [];
    delimiter = '|';

    filterManager = null;

    constructor(filterManager, compendiumManager) {
        this.filterManager = filterManager;
        this.compendiumManager = compendiumManager;
    }

    async buildActionList(token) {
        let actionList = await this.doBuildActionList(token);
        this._doBuildFurtherActions(token, actionList);
        await this.compendiumManager.addCategoriesToActionList(this, actionList);
        return actionList;
    }

    async doBuildActionList(token) {};

    _doBuildFurtherActions(token, actionList) {
        this.furtherActionHandlers.forEach(handler => handler.extendActionList(actionList))
    }

    addFurtherActionHandler(handler) {
        this.furtherActionHandlers.push(handler);
    }

    initializeEmptyActionList() {
        return new ActionList();
    }

    initializeEmptyCategory(categoryId) {
        let category = new Category();
        category.id = categoryId;
        return category;
    }

    initializeEmptySubcategory(id = '') {
        let subcategory = new Subcategory();
        subcategory.id = id;
        return subcategory;
    }

    _combineCategoryWithList(result, categoryName, category, push = true) {
        if (!category)
            return;

        if (categoryName?.length > 0)
            category.name = categoryName;

        if (category.subcategories.length > 0 || category.canFilter) {
            if (push)
                result.categories.push(category);
            else
                result.categories.unshift(category);
        }
    }

    _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
        if (!subcategory)
            return;
            
        if (subcategoryName?.length > 0)
            subcategory.name = subcategoryName;
        
        if (subcategory.subcategories.length > 0 || subcategory.actions.length > 0 || subcategory.canFilter)
            category.subcategories.push(subcategory);
    }
}
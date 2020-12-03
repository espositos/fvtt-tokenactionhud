import { FilterCategory } from './filterCategory.js';
import * as settings from '../../settings.js';

export class CategoryManager {
    categories = [];
    user = null;

    constructor(user, filterManager) {
        this.user = user;
        this.filterManager = filterManager;
    }

    async reset() {
        this.categories = [];
        await game.user.unsetFlag('token-action-hud', 'categories');
    }

    async init() {
        let savedCategories = this.user.getFlag('token-action-hud', 'categories');
        if (savedCategories) {
            settings.Logger.debug('saved categories:', savedCategories);
            
            for (let cat of Object.values(savedCategories)) {
                let id = cat.id;
                let title = cat.title;
                let push = cat.push ?? false;
                let core = cat.core ?? false;
                if (!(id || title))
                    continue;

                let category = new FilterCategory(this.filterManager, id, title, push, core);

                let subcategories = cat.subcategories;
                if (subcategories) {
                    subcategories = Object.values(subcategories);
                    await category.selectSubcategories(subcategories);
                }
                this.categories.push(category);
            }
        }
    }

    async addCategoriesToActionList(actionHandler, actionList) {
        let alwaysShow = settings.get('alwaysShowAdditionalCategories');
        
        if (alwaysShow){
            if (!actionList.tokenId) {
                actionList.tokenId = 'categoryManager';
            }

            if (!actionList.actorId) {
                actionList.actorId = 'categoryManager'
            }
        }

        if (!actionList.tokenId)
            return;

        await this.doAddCategories(actionHandler, actionList)
    }

    async doAddCategories(actionHandler, actionList) {
        for (let category of this.categories) {
            await category.addToActionList(actionHandler, actionList)
        }
    }

    async submitCategories(selections, push) {
        selections = selections.map(s => { return {id: s.value.slugify({replacement: '_', strict: true}), value: s.value}})
        for (let choice of selections) {
            let category = this.categories.find(c => c.id === choice.id);
            if (!category)
                await this._createCategory(choice, push);
            else
                await this._updateCategory(category, push);
        }

        let idMap = selections.map(s => s.id);

        if (this.categories.length === 0)
            return;

        for (var i = this.categories.length - 1; i >= 0; i--) {
            let category = this.categories[i];
            if (!(idMap.includes(category.id) || category.core))
                await this.deleteCategory(i);
        }
    }

    async addCoreCategories(categories) {
        for (let core of categories) {
            let existing = this.categories.find(cat => cat.id === core.id);
            if (existing && !existing.core) {
                existing.core = true;
                await existing.updateFlag();
                continue;
            } else if (existing) {
                continue;
            }
            await this._createCategory({ id: core.id, value: core.name }, false, true);
        }
    }

    async _createCategory(tagifyCategory, push, core = false) {
        let newCategory = new FilterCategory(this.filterManager, tagifyCategory.id, tagifyCategory.value, push, core);
        await newCategory.updateFlag();
        this.categories.push(newCategory);
    }

    async _updateCategory(category, push) {
        category.push = push;
        await category.updateFlag();
    }

    async deleteCategory(index) {
        let category = this.categories[index];
        await category.prepareForDelete();
        this.categories.splice(index, 1);
    }

    async submitSubcategories(categoryId, choices) {
        let category = this.categories.find(c => c.id === categoryId);

        if (!category)
            return;

        await category.selectSubcategories(choices);
    }

    getExistingCategories() {
        return this.categories.filter(c => !c.core).map(c => c.asTagifyEntry());
    }

    isCompendiumCategory(id) {
        return this.categories.some(c => c.id === id);
    }

    isLinkedCompendium(id) {
        return this.categories.some(c => c.subcategories?.some(c => c.compendiumId === id));
    }

    arePush() {
        let categories = this.categories.filter(c => !c.core);
        let pushCount = categories.filter(c => c.push).length;
        return pushCount >= categories.length / 2;
    }

    getCategorySubcategoriesAsTagifyEntries(categoryId) {
        let category = this.categories.find(c => c.id === categoryId);

        if (!category)
            return;

        return category.getSubcategoriesAsTagifyEntries();
    }
}
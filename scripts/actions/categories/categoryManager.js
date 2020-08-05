import { Category } from './category.js';
import * as settings from '../../settings.js';

export class CategoryManager {
    categories = [];
    user = null;

    constructor(user, filterManager) {
        this.user = user;
        this.filterManager = filterManager;
    }

    async init() {
        let savedCategories = this.user.getFlag('token-action-hud', 'categories');
        if (savedCategories) {
            settings.Logger.debug('saved categories:', savedCategories);
            
            for (let cat of Object.entries(savedCategories)) {
                let id = cat[1].id;
                let title = cat[1].title;
                let push = cat[1].push;
                if (!(id || title))
                    continue;

                let category = new Category(this.filterManager, id, title, push);

                let compendiums = cat[1].compendiums;
                if (compendiums) {
                    let compendiums = Object.values(cat[1].compendiums);
                    await category.selectSubcategories(compendiums);
                }
                this.categories.push(category);
            }
        }
    }

    async addCategoriesToActionList(actionHandler, actionList) {
        let alwaysShow = settings.get('alwaysShowAdditionalCategories');
        if (alwaysShow){
            if (!actionList.tokenId)
                actionList.tokenId = 'compendiums';
            if (!actionList.actorId)
                actionList.actorId = 'compendiums'
        }

        if (!actionList.tokenId)
            return;

        for (let category of this.categories) {
            await category.addToActionList(actionHandler, actionList)
        }
    }

    async submitCategories(selections, push) {
        selections = selections.map(s => { return {id: s.value.slugify({replacement: '_', strict: true}), value: s.value}})
        for (let choice of selections) {
            let category = this.categories.find(c => c.id === choice.id);
            if (!category)
                await this.createCategory(choice, push);
            else
                await this.updateCategory(category, push);
        }

        let idMap = selections.map(s => s.id);

        if (this.categories.length === 0)
            return;

        for (var i = this.categories.length - 1; i >= 0; i--) {
            let category = this.categories[i];
            if (!idMap.includes(category.id))
                await this.deleteCategory(i);
        }
    }

    async createCategory(tagifyCategory, push) {
        let newCategory = new Category(this.filterManager, tagifyCategory.id, tagifyCategory.value, push);
        await newCategory.updateFlag();
        this.categories.push(newCategory);
    }

    async updateCategory(compendiumCategory, push) {
        compendiumCategory.push = push;
        await compendiumCategory.updateFlag();
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
        return this.categories.map(c => c.asTagifyEntry());
    }

    isCompendiumCategory(id) {
        return this.categories.some(c => c.id === id);
    }

    isLinkedCompendium(id) {
        return this.categories.some(c => c.compendiums.some(c => c.id === id));
    }

    arePush() {
        return this.categories.filter(c => c.push).length >= this.categories.filter(c => !c.push).length;
    }

    getCategoryCompendiumsAsTagifyEntries(categoryId) {
        let category = this.categories.find(c => c.id === categoryId);

        if (!category)
            return;

        return category.getCompendiumsAsTagifyEntries();
    }
}
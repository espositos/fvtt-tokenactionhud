import { CompendiumCategory } from './compendiumCategory.js';
import * as settings from '../../settings.js';

export class CompendiumCategoryManager {
    categories = [];
    user = null;

    constructor(user, filterManager) {    
        this.user = user;
        this.filterManager = filterManager;

        let savedCategories = user.getFlag('token-action-hud', 'compendiumCategories');
        if (savedCategories) {
            settings.Logger.debug('saved categories:', savedCategories);
            
            Object.entries(savedCategories).forEach(f => {
                let category = new CompendiumCategory(this.filterManager, f[0], f[1].title);
                let compendiums = Object.values(f[1].compendiums);
                category.selectCompendiums(compendiums);
                this.categories.push(category);
            })
        }
    }

    async addCategoriesToActionList(actionHandler, actionList) {
        if (!actionList.tokenId)
            actionList.tokenId = 'compendiums';
        if (!actionList.actorId)
            actionList.actorId = 'compendiums'

        for (let category of this.categories) {
            await category.addToActionList(actionHandler, actionList)
        }
    }

    async submitCategories(selections) {
        selections = selections.map(s => { return {id: s.value.slugify({strict: true}), value: s.value}})
        for (let choice of selections) {
            if (!this.categories.some(c => c.id === choice.id))
                await this.createCategory(choice);
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

    async createCategory(tagifyCategory) {
        let newCategory = new CompendiumCategory(this.filterManager, tagifyCategory.id, tagifyCategory.value);
        await newCategory.updateFlag();
        this.categories.push(newCategory);
    }

    async deleteCategory(index) {
        let category = this.categories[index];
        await category.prepareForDelete();
        this.categories.splice(index, 1);
    }

    async submitCompendiums(categoryId, choices) {
        let category = this.categories.find(c => c.id === categoryId);

        if (!category)
            return;

        await category.selectCompendiums(choices);
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

    getCategoryCompendiumsAsTagifyEntries(categoryId) {
        let category = this.categories.find(c => c.id === categoryId);

        if (!category)
            return;

        return category.getCompendiumsAsTagifyEntries();
    }
}
import { CompendiumCategory } from './compendiumCategory.js';
import * as settings from '../../settings.js';

export class CompendiumCategoryManager {
    categories = [];
    user = null;

    constructor(user, filterManager) {    
        this.user = user;

        let savedCategories = user.getFlag('token-action-hud', 'compendiumCategories');
        if (savedCategories) {
            settings.Logger.debug('saved categories:', savedCategories);
            
            Object.entries(savedCategories).forEach(f => {
                let category = new CompendiumCategory(f[0], f[1].title);
                category.selectCompendiums(f[1].compendiums);
                this.categories.push(category);
            })
        }
            
        this.filterManager = filterManager;
    }

    addCategoriesToActionList(actionHandler, actionList) {
        this.categories.forEach(c => c.addToActionList(actionHandler, actionList));
    }

    submitCategories(selections) {
        selections = selections.map(s => { return {id: s.value.slugify({strict: true}), value: s.value}})
        for (let choice of selections) {
            if (!this.categories.some(c => c.id === choice.id))
                this.createCategory(choice);
        }

        let idMap = selections.map(s => s.id);

        if (this.categories.length === 0)
            return;

        for (var i = this.categories.length - 1; i >= 0; i--) {
            let category = this.categories[i];
            if (!idMap.includes(category.id))
                this.deleteCategory(i);
        }
    }

    createCategory(category) {
        let newCategory = new CompendiumCategory(category.id, category.value);
        newCategory.updateFlag();
        this.categories.push(newCategory);
    }

    deleteCategory(index) {
        let category = this.categories[index];
        category.unsetFlag();
        this.categories.splice(index, 1);
    }

    getExistingCategories() {
        return this.categories.map(c => c.asTagifyEntry());
    }

    submitCompendiums(categoryId, choices) {
        let category = this.categories.find(c => c.id === categoryId);

        if (category)
            return;

        category.selectCompendiums(choices);
    }

    getCategoryCompendiumsAsTagifyEntries(categoryId) {
        let category = this.categories.find(c => c.id === categoryId);

        if (!category)
            return;

        return category.getCompendiumsAsTagifyEntries();
    }
}
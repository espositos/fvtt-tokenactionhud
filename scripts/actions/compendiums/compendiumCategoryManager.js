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
        }

        Object.entries(savedCategories).forEach(f => {
            let category = new CompendiumCategory(this.actionHandler, f[0], f[1].title);
            category.addCompendiums(f[1].compendiums);
            this.categories.push(category);
        })

        this.filterManager = filterManager;
    }

    addCategoriesToActionList(actionList) {
        this.categories.forEach(c => c.addToActionList(actionList));
    }

    submitCategories(actionHandler, selections) {
        for (let choice of selections) {
            if (!this.categories.some(c => c.id === choice.id))
                this.createCategory(actionHandler, choice);
        }

        let idMap = selections.map(s => s.id);

        for (var i = this.categories.length - 1; i >= 0; i--) {
            if (!idMap.includes(this.categories[i].id))
                this.deleteCategory(i);
        }
    }

    createCategory(actionHandler, category) {
        let category = new CompendiumCategory(actionHandler, category.id, category.value);
        category.setFlag();
        this.categories.push(newCategory);
    }

    deleteCategory(index) {
        let category = this.categories[index];
        category.unsetFlag();
        this.categories.splice(i, 1);
    }
}
import { HudCategory } from './hudCategory.js';
import { HudCompendium } from './hudCompendium.js';
import * as settings from '../../settings.js';

export class CategoryManager {
    categories = [];
    user = null;

    constructor(user, filterManager, actionHandler) {    
        this.user = user;

        let savedCategories = user.getFlag('token-action-hud', 'categories');
        if (savedCategories) {
            settings.Logger.debug('saved categories:', savedCategories);
        }

        Object.entries(savedCategories).forEach(f => {
            let category = new HudCategory(this.actionHandler, f[0], f[1].title);
            category.addCompendiums(f[1].compendiums);
            this.categories.push(category);
        })

        this.actionHandler = actionHandler;
        this.filterManager = filterManager;
    }

    selectCategories(selections) {
        for (let choice of selections) {
            if (this.categories.some(c => c.id !== choice.id))
                this.createCategory(choice);
        }
    }

    createCategory(category) {
        let newCategory = { id: category.id, title: category.value, compendiums: [] };
        this.categories.push(newCategory);
    }

    addCompendiumsToCategory(categoryId, compendiums) {
        let category = this.categories.find(c => c.id === categoryId);

        compendiums.forEach(compendium => {
            this.addCompendiumToCategory(category, compendium)
        })

        category.compendiums.forEach(c => {
            if (compendiums.some(comp => comp.id === c.id)) {}
        })
    }

    addCompendiumToCategory(category, compendium) {
        if (!category.compendiums.some(c => c.id === compendium.id))
            category.compendiums.push(new HudCompendium(actionHandler, filterManager, compendium.id, compendium.value));
    }

    removeCategory(category) {
        let index = this.categories.indexOf(category);
        this.categories.splice(index, 1);
    }
}
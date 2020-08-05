import {CompendiumSubcategory} from './compendiumSubcategory.js';
import {CompendiumHelper} from './compendiumHelper.js';

export class Category {
    subcategories = [];
    id = '';
    key = '';
    title = '';

    constructor(filterManager, id, title, push) {
        this.filterManager = filterManager;
        this.id = id;
        this.key = id.slugify({replacement: '_', strict:true})
        this.title = title;
        this.push = push;
    }

    async addToActionList(actionHandler, actionList) {
        let result = actionHandler.initializeEmptyCategory(this.id);
        result.canFilter = true;

        for (let subcategory of this.subcategories) {
            await subcategory.addToCategory(actionHandler, result);
        }

        actionHandler._combineCategoryWithList(actionList, this.title, result, this.push);

        return actionList;
    }

    async selectSubcategories(compendiums) {
        compendiums = compendiums.filter(c => !!c.id)

        for (let comp of compendiums) {
            await this.addCompendiumSubcategory(comp);
        }

        if (this.subcategories.length === 0)
            return;

        let idMap = compendiums.map(c => c.id);
        for (var i = this.subcategories.length - 1; i >= 0; i--) {
            let compendium = this.subcategories[i];
            if (!idMap.includes(compendium.compendiumId))
               await this.removeCompendium(i)
        }

        this.updateFlag();
    }

    async addCompendiumSubcategory(compendium) {
        if (this.subcategories.some(c => c.compendiumId === compendium.id))
            return;

        if (!CompendiumHelper.exists(compendium.id))
            return;

        let hudCompendium = new CompendiumSubcategory(this.filterManager, this.key, compendium.id, compendium.title);
        hudCompendium.createFilter();
        await hudCompendium.submitFilterSuggestions();

        this.subcategories.push(hudCompendium);
    }

    async updateFlag() {
        await game.user.setFlag('token-action-hud', `categories.${this.key}.title`, this.title);
        await game.user.setFlag('token-action-hud', `categories.${this.key}.id`, this.id);
        await game.user.setFlag('token-action-hud', `categories.${this.key}.push`, this.push);

        for (let subcategory of this.subcategories) {
            subcategory.updateFlag(this.key);
        }
    }

    async removeCompendium(index) {
        let subcategory = this.subcategories[index];
        await subcategory.clearFilter();
        await subcategory.unsetFlag();
        this.subcategories.splice(index, 1);
    }

    async prepareForDelete() {
        await this.clearFilters();
        await this.unsetFlag();
    }

    async clearFilters() {
        for (let c of this.subcategories) {
            await c.clearFilter();
        }
    }

    async unsetFlag() {
        await game.user.setFlag('token-action-hud', 'categories', {[`-=${this.key}`]: null});
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title}
    }

    getCompendiumsAsTagifyEntries() {
        return this.subcategories.map(c => c.asTagifyEntry())
    }
}
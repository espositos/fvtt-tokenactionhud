import {CompendiumSubcategory} from './compendiumSubcategory.js';
import {MacroSubcategory} from './macroSubcategory.js';
import {CompendiumHelper} from './compendiumHelper.js';
import {SubcategoryType} from '../../enums/subcategoryType.js';

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

    async selectSubcategories(selection) {
        for (let subcat of selection) {
            if (subcat.type === SubcategoryType.COMPENDIUM)
                await this.addCompendiumSubcategory(subcat);
            else
                await this.addMacroSubcategory(subcat);
        }

        if (this.subcategories.length === 0)
            return;

        let titleMap = selection.map(subcat => subcat.title);
        for (var i = this.subcategories.length - 1; i >= 0; i--) {
            let subcat = this.subcategories[i];
            if (!titleMap.includes(subcat.title))
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
    
    async addMacroSubcategory(choice) {
        if (this.subcategories.some(c => c.title === choice.title))
            return;

        let subcategory = new MacroSubcategory(this.filterManager, this.key, choice.title);
        subcategory.createFilter();
        await subcategory.submitFilterSuggestions();

        this.subcategories.push(subcategory);
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

    getSubcategoriesAsTagifyEntries() {
        return this.subcategories.map(c => c.asTagifyEntry())
    }
}
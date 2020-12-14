import {CompendiumSubcategory} from './compendiumSubcategory.js';
import {MacroSubcategory} from './macroSubcategory.js';
import {CompendiumHelper} from './compendiumHelper.js';
import {SubcategoryType} from '../../enums/subcategoryType.js';

export class FilterCategory {
    subcategories = [];
    id = '';
    key = '';
    title = '';
    push = false; // push or shift when adding to actionList
    core = false; // is it a base category; if so, don't always display

    constructor(filterManager, id, title, push, core) {
        this.filterManager = filterManager;
        this.id = id;
        this.key = id.slugify({replacement: '_', strict:true})
        this.title = title;
        this.push = push;
        this.core = core ?? false;
    }

    async addToActionList(actionHandler, actionList) {
        if (actionList.categories.some(c => c.name === this.title)) {
            let existingCat = actionList.categories.find(c => c.name === this.title);

            if (!existingCat.subcategories.length)
                return;

            await this.addSubcategoriesToCategory(actionHandler, existingCat);
        } else {
            await this.doAddToActionList(actionHandler, actionList);
        }
    }

    async doAddToActionList(actionHandler, actionList) {
        if (this.core)
            return;

        let result = actionHandler.initializeEmptyCategory(this.id);
        result.core = this.core;

        await this.addSubcategoriesToCategory(actionHandler, result);

        actionHandler._combineCategoryWithList(actionList, this.title, result, this.push);
    }

    async addSubcategoriesToCategory(actionHandler, category) {
        for (let subcategory of this.subcategories) {
            await subcategory.addToCategory(actionHandler, category);
        }
    }

    async selectSubcategories(selection) {
        for (let subcat of selection) {
            if (subcat.type === SubcategoryType.COMPENDIUM)
                await this.addCompendiumSubcategory(subcat);
            else
                this.addMacroSubcategory(subcat);
        }

        if (this.subcategories.length === 0)
            return;

        let titleMap = selection.map(subcat => subcat.title);
        for (var i = this.subcategories.length - 1; i >= 0; i--) {
            let subcat = this.subcategories[i];
            if (!titleMap.includes(subcat.title))
               await this.removeSubcategory(i)
        }

        await this.updateFlag();
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
    
    addMacroSubcategory(choice) {
        if (this.subcategories.some(c => c.title === choice.title))
            return;

        let subcategory = new MacroSubcategory(this.filterManager, this.key, choice.title);
        subcategory.createFilter();
        subcategory.submitFilterSuggestions();

        this.subcategories.push(subcategory);
    }

    async updateFlag() {
        let update = {categories: {[this.key]: {title: this.title, id: this.id, push: this.push, core: this.core}}};
        await game.user.update({flags: {'token-action-hud': update}});

        for (let subcategory of this.subcategories) {
            await subcategory.updateFlag(this.key);
        }
    }

    async removeSubcategory(index) {
        let subcategory = this.subcategories[index];
        await subcategory.clearFilter();
        await subcategory.unsetFlag(this.key);
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
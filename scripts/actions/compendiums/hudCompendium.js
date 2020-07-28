import { CompendiumHelper } from './compendiumHelper.js';

export class HudCompendium {
    constructor(filterManager, categoryId, compendiumId, title) {
        this.filterManager = filterManager;
        this.id = `${categoryId}_${compendiumId}`.slugify({replacement: '_', strict:true});
        this.compendiumId = compendiumId;
        this.title = title;
    }

    async updateFlag(categoryId) {
        let contents = {id: this.compendiumId, title: this.title}
        await game.user.setFlag('token-action-hud', `compendiumCategories.${categoryId}.compendiums.${this.id}`, contents);
    }

    async unsetFlag(categoryId) {
        if (categoryId)
            await game.user.setFlag('token-action-hud', `compendiumCategories.${categoryId}.compendiums`, {[`-=${this.id}`]: null})
    }

    createFilter() {
        this.filterManager.createOrGetFilter(this.id);
    }

    async clearFilter() {
        await this.filterManager.clearFilter(this.id);
    }

    async submitFilterSuggestions() {
        let suggestions = await CompendiumHelper.getCompendiumEntriesForFilter(this.compendiumId);
        this.filterManager.setSuggestions(this.id, suggestions);
    }

    setFilteredElements(elements, isBlocklist) {
        this.filterManager.setFilteredElements(this.id, elements, isBlocklist);
    }

    async addToCategory(actionHandler, category) {
        let subcategory = actionHandler.initializeEmptySubcategory(this.id);
        subcategory.actions = await this._createCompendiumActions(actionHandler.delimiter);
        subcategory.canFilter = true;
        actionHandler._combineSubcategoryWithCategory(category, this.title, subcategory);
    }

    async _createCompendiumActions(delimiter) {
        let packEntries = await CompendiumHelper.getEntriesForActions(this.compendiumId, delimiter);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        let actions = packEntries;

        if (filters.length > 0)
            actions = packEntries.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return actions;
    }

    asTagifyEntry() {
        return {id: this.compendiumId, value: this.title}
    }
}
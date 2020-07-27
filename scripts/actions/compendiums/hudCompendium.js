import { CompendiumHelper } from './compendiumHelper.js';

export class HudCompendium {
    constructor(filterManager, key, title) {
        this.filterManager = filterManager;
        this.id = key;
        this.title = title;

        this.createFilter();
        this.submitFilterSuggestions();
    }

    createFilter() {
        this.filterManager.createOrGetFilter(this.id);
    }

    async clearFilter() {
        await this.filterManager.clearFilter(this.id);
    }

    async submitFilterSuggestions() {
        let suggestions = await CompendiumHelper.getCompendiumEntriesForFilter(this.id);
        this.filterManager.setSuggestions(this.id, suggestions);
    }

    setFilteredElements(elements, isBlocklist)
    {
        this.filterManager.setFilteredElements(this.id, elements, isBlocklist);
    }

    async addToCategory(actionHandler, category) {
        let subcategory = actionHandler.initializeEmptySubcategory(this.id);
        subcategory.actions = await this._createCompendiumActions(actionHandler.delimiter);
        subcategory.canFilter = true;
        actionHandler._combineSubcategoryWithCategory(category, this.title, subcategory);
    }

    async _createCompendiumActions(delimiter) {
        let packEntries = await CompendiumHelper.getEntriesForActions(this.id, delimiter);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        let actions = packEntries;

        if (filters.length > 0)
            actions = packEntries.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return actions;
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title}
    }
}
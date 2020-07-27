import { CompendiumHelper } from './compendiumHelper.js';

export class HudCompendium {
    constructor(filterManager, categoryId, id, title) {
        this.filterManager = filterManager;
        this.id = id;
        this.title = title;

        // used wherever the '.' will cause problems: as a key for flags, etc (also filters).
        let cleanId = id.slugify({strict:true});
        this.key = categoryId + cleanId;

        this.createFilter();
        this.submitFilterSuggestions();
    }

    createFilter() {
        this.filterManager.createOrGetFilter(this.key);
    }

    async clearFilter() {
        await this.filterManager.clearFilter(this.key);
    }

    async submitFilterSuggestions() {
        let suggestions = await CompendiumHelper.getCompendiumEntriesForFilter(this.id);
        this.filterManager.setSuggestions(this.key, suggestions);
    }

    setFilteredElements(elements, isBlocklist)
    {
        this.filterManager.setFilteredElements(this.key, elements, isBlocklist);
    }

    async addToCategory(actionHandler, category) {
        let subcategory = actionHandler.initializeEmptySubcategory(this.key);
        subcategory.actions = await this._createCompendiumActions(actionHandler.delimiter);
        subcategory.canFilter = true;
        actionHandler._combineSubcategoryWithCategory(category, this.title, subcategory);
    }

    async _createCompendiumActions(delimiter) {
        let packEntries = await CompendiumHelper.getEntriesForActions(this.id, delimiter);

        let filters = this.filterManager.getFilteredIds(this.key);
        let isBlocklist = this.filterManager.isBlocklist(this.key);
      
        let actions = packEntries;

        if (filters.length > 0)
            actions = packEntries.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return actions;
    }

    async updateFlag(categoryId) {
        let contents = {id: this.id, title: this.title}
        await game.user.setFlag('token-action-hud', `compendiumCategories.${categoryId}.compendiums.${this.key}`, contents);
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title}
    }
}
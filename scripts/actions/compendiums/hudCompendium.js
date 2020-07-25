import { CompendiumHelper } from './compendiumHelper.js';

export class HudCompendium {
    constructor(actionHandler, filterManager, id, title) {
        this.actionHandler = actionHandler;
        this.filterManager = filterManager;
        this.id = id;
        this.title = title;

        this.createFilter();
        this.addFilterChoices();
    }

    createFilter() {
        this.filterManager.createOrGetFilter(this.id);
    }

    async submitFilterSuggestions() {
        let suggestions = await CompendiumHelper.getCompendiumEntriesForFilter(this.id);
        this.filterManager.setSuggestions(this.id, suggestions);
    }

    setFilteredElements(elements, isBlocklist)
    {
        this.filterManager.setFilteredElements(this.id, elements, isBlocklist);
    }

    async addToCategory(category) {
        let subcategory = this.actionHandler.initializeEmptySubcategory(this.id);
        subcategory.actions = await this._createCompendiumActions();
        subcategory.canFilter = true;
        this.actionHandler._combineSubcategoryWithCategory(category, this.title, subcategory);
    }

    async _createCompendiumActions() {
        let packEntries = await CompendiumHelper.getEntriesForActions(this.id);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        let actions = packEntries.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return actions;
    }
}
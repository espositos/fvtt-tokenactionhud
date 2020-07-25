import {CompendiumManager} from './compendiumManager.js';

export class HudCompendium {
    constructor(actionHandler, filterManager, id, title) {
        this.actionHandler = actionHandler;
        this.compendiumManager = compendiumManager;
        this.filterManager = filterManager;
        this.id = id;
        this.title = title;

        this.createFilter();
        this.addFilterChoices();
    }

    createFilter() {
        this.filterManager.createFilter(this.id);
    }

    async submitFilterSuggestions() {
        let suggestions = await CompendiumManager.getCompendiumEntriesForFilter(this.id);
        this.filterManager.setSuggestions(this.id, suggestions);
    }

    setFilteredElements(elements, isBlocklist)
    {
        this.filterManager.setFilteredElements(this.id, elements, isBlocklist);
    }

    async addToCategory(category) {
        let subcategory = this.actionHandler.initializeEmptySubcategory(this.id);
        subcategory.actions = await this._createCompendiumActions();

        this.filterManager.setCanFilter(subcategory);
        this.actionHandler._combineSubcategoryWithCategory(category, this.title, subcategory);
    }

    async _createCompendiumActions() {
        let packEntries = await CompendiumManager.getEntriesForActions(this.id);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        let actions = packEntries.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return actions;
    }
}
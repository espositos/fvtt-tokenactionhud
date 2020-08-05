import { MacroHelper } from './macroHelper.js';

export class MacroSubcategory {
    constructor(filterManager, categoryId, title) {
        this.filterManager = filterManager;
        this.id = `${categoryId}_${title}`.slugify({replacement: '_', strict:true});
        this.title = title;
    }

    async updateFlag(categoryId) {
        let contents = {id: this.id, title: this.title}
        await game.user.setFlag('token-action-hud', `categories.${categoryId}.subcategories.${this.id}`, contents);
    }

    async unsetFlag(categoryId) {
        if (categoryId)
            await game.user.setFlag('token-action-hud', `categories.${categoryId}.subcategories`, {[`-=${this.id}`]: null})
    }

    createFilter() {
        this.filterManager.createOrGetFilter(this.id);
    }

    async clearFilter() {
        await this.filterManager.clearFilter(this.id);
    }

    async submitFilterSuggestions() {
        let suggestions = MacroHelper.getMacrosForFilter();
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
        let possibleMacros = MacroHelper.getEntriesForActions(delimiter);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        let actions = possibleMacros;

        if (filters.length > 0)
            actions = possibleMacros.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return actions;
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title}
    }
}
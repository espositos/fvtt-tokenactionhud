import { MacroHelper } from './macroHelper.js';
import { SubcategoryType } from '../../enums/subcategoryType.js';

export class MacroSubcategory {
    constructor(filterManager, categoryKey, title) {
        this.filterManager = filterManager;
        this.id = `${categoryKey}_${title}`.slugify({replacement: '_', strict:true});
        this.title = title;
        this.type = SubcategoryType.MACRO;
    }

    async updateFlag(categoryId) {
        let contents = {id: this.id, title: this.title, type: this.type}
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

    addToCategory(actionHandler, category) {
        let subcategory = actionHandler.initializeEmptySubcategory(this.id);
        subcategory.actions = this._createMacroActions(actionHandler.delimiter);
        subcategory.canFilter = true;
        actionHandler._combineSubcategoryWithCategory(category, this.title, subcategory);
    }

    _createMacroActions(delimiter) {
        let possibleMacros = MacroHelper.getEntriesForActions(delimiter);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        if (filters.length === 0)
            return [];

        let filteredActions = possibleMacros.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return filteredActions;
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title, type: this.type}
    }
}
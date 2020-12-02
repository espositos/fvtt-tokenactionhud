export class FilterSubcategory {
    constructor(filterManager, title) {
        this.filterManager = filterManager;
        this.title = title;
    }

    async updateFlag(categoryId) {
        let contents = this.getFlagContents();
        await game.user.setFlag('token-action-hud', `categories.${categoryId}.subcategories.${this.id}`, contents);
    }

    async unsetFlag(categoryId) {
        if (categoryId)
            await game.user.setFlag('token-action-hud', `categories.${categoryId}.subcategories`, {[`-=${this.id}`]: null})
    }

    createFilter() {
        this.filterManager.createOrGetFilter(this.id);
    }

    clearFilter() {
        this.filterManager.clearFilter(this.id);
    }

    async setFilteredElements(elements, isBlocklist) {
        await this.filterManager.setFilteredElements(this.id, elements, isBlocklist);
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title, type: this.type}
    }
    
    async addToCategory(actionHandler, category) {
        let subcategory = actionHandler.initializeEmptySubcategory(this.id);
        subcategory.actions = await this._getActions(actionHandler.delimiter);
        subcategory.canFilter = true;
        actionHandler._combineSubcategoryWithCategory(category, this.title, subcategory);
    }

    getFlagContents() {
        return {id: this.id, title: this.title, type: this.type};
    }

    async _getActions() {
        return [];
    }
}
export class ActionHandler {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    linkedCompendiumsGm = {};
    linkedCompendiumsPlayer = {};
    delimiter = '|';

    emptyActionList = {
        tokenId: '',
        actorId: '',
        categories: []
    }

    emptyCategory = {
        id: '',
        name: '',
        canFilter: false,
        subcategories: []
    }

    emptySubcategory = {
        id: '',
        name: '',
        info1: '',
        actions: []
    }

    constructor() {}

    async buildActionList(token) {};

    initializeEmptyActionList() {
        return Object.assign(this.emptyActionList, {});
    }

    initializeEmptyCategory(categoryId, canFilter) {
        let category = Object.assign(this.emptyCategory, {});
        category.canFilter = canFilter;
        category.id = categoryId;
        return category;
    }

    initializeEmptySubcategory() {
        return Object.assign(this.emptySubcategory, {});
    }

    _combineCategoryWithList(result, categoryName, category) {
        if (!category)
            return;

        category.name = categoryName;

        if (category.subcategories.length > 0)
            result.categories.push(category);
    }

    _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
        if (!subcategory)
            return;
            
        subcategory.name = subcategoryName;

        if (subcategory.actions.length > 0 || subcategory.subcategories.length > 0)
            category.subcategories.push(subcategory);
    }

    isLinkedCompendium(isGM, compendiumKey) {
        if (!compendiumKey)
            return false;

        let compendiums = isGM ? this.linkedCompendiumsGm : this.linkedCompendiumsPlayer;

        if (!Array.isArray(compendiums))
            return false;

        return compendiums.includes(compendiumKey);
    }

    addGmSystemCompendium(name, key, isMacro) {
        this.linkedCompendiumsGm[name] = {key: key, isMacro: isMacro};
    }

    addPlayerSystemCompendium(name, key, isMacro) {
        this.linkedCompendiumsPlayer[name] = {key: key, isMacro: isMacro};
    }

    async addCompendiums(actionList) {
        let actorType = game.user.isGM ? 'gm' : 'player';
        let systemCompendiums = game.user.isGM ? this.linkedCompendiumsGm : this.linkedCompendiumsPlayer;

        actionList.tokenId = actorType;
        actionList.actorId = actorType;

        await this._addCompendiums(actionList, actorType, systemCompendiums);
    }

    async _addCompendiums(actionList, actorType, compendiums) {
        for (let [k, v] of Object.entries(compendiums)) {
            if (!(k && v))
                continue;

            let entries = await this._getCompendiumEntries(actorType, k, v.key, v.isMacros);
            this._combineCategoryWithList(actionList, k, entries);
        }
    }
    
    async _getCompendiumEntries(actorType, categoryName, compendiumKey, isMacros) {
        let pack = game?.packs?.get(compendiumKey);
        if (!pack)
            return;

        let result = this.initializeEmptyCategory();

        let macroType = isMacros ? 'macrocompendium' : 'compendium';            

        let packEntries = pack.index.length > 0 ? pack.index : await pack.getIndex();
        let encodedValue = [actorType, macroType, compendiumKey, e._id].join(this.delimiter);
        let entriesMap = packEntries.map(e => { return {name: e.name, encodedValue: encodedValue, id: e.id } })
        
        let entries = this.initializeEmptySubcategory();
        entries.actions = entriesMap;

        this._combineSubcategoryWithCategory(result, categoryName, entries);

        return result;
    }
}


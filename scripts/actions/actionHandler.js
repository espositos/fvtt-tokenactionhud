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
        actions: [],
        subcategories: []
    }

    constructor() {}

    async buildActionList(token, filters) {};

    initializeEmptyActionList() {
        return JSON.parse(JSON.stringify(this.emptyActionList));
    }

    getFilterChoices(categoryId, actor) {
        return [];
    }

    initializeEmptyCategory(categoryId, canFilter) {
        let category = JSON.parse(JSON.stringify(this.emptyCategory));
        category.canFilter = canFilter;
        category.id = categoryId;
        return category;
    }

    initializeEmptySubcategory(subcategoryName = '') {
        let subcategory = JSON.parse(JSON.stringify(this.emptySubcategory));
        subcategory.name = subcategoryName;
        return subcategory;
    }

    _combineCategoryWithList(result, categoryName, category) {
        if (!category)
            return;

        if (categoryName?.length > 0)
            category.name = categoryName;

        if (category.subcategories.length > 0)
            result.categories.push(category);
    }

    _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
        if (!subcategory)
            return;
            
        if (subcategoryName?.length > 0)
            subcategory.name = subcategoryName;

        if (subcategory.actions.length > 0 || subcategory.subcategories.length > 0)
            category.subcategories.push(subcategory);
    }

    /** Compendiums */

    _addGmSystemCompendium(name, key, isMacro) {
        this.linkedCompendiumsGm[name] = {key: key, isMacro: isMacro};
    }

    _addPlayerSystemCompendium(name, key, isMacro) {
        this.linkedCompendiumsPlayer[name] = {key: key, isMacro: isMacro};
    }

    async _addCompendiumsToList(actionList) {
        let actorType = game.user.isGM ? 'gm' : 'player';
        let systemCompendiums = game.user.isGM ? this.linkedCompendiumsGm : this.linkedCompendiumsPlayer;

        actionList.tokenId = actorType;
        actionList.actorId = actorType;

        await this._combineCompendiums(actionList, actorType, systemCompendiums);
    }

    async _combineCompendiums(actionList, actorType, compendiums) {
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


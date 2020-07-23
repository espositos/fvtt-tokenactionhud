import * as settings from '../settings.js';

export class ActionHandler {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    linkedCompendiumsGm = [];
    linkedCompendiumsPlayer = [];
    furtherActionHandlers = [];
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

    filterManager = null;

    constructor(filterManager) {
        this.filterManager = filterManager;
    }

    async buildActionList(token, filters) {
        let actionList = await this.doBuildActionList(token, filters);
        this._doBuildFurtherActions(token, filters, actionList);
        return actionList;
    }

    async doBuildActionList(token, filters) {};

    _doBuildFurtherActions(token, filters, actionList) {
        this.furtherActionHandlers.forEach(handler => handler.extendActionList(actionList))
    }

    addFurtherActionHandler(handler) {
        this.furtherActionHandlers.push(handler);
    }

    initializeEmptyActionList() {
        return JSON.parse(JSON.stringify(this.emptyActionList));
    }

    initializeEmptyCategory(categoryId) {
        let category = JSON.parse(JSON.stringify(this.emptyCategory));
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

        category.name = categoryName;

        if (category.subcategories.length > 0 || category.choices > 0)
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
        this.linkedCompendiumsGm.push( {name: name, key: key, isMacro: isMacro} );
    }

    _addPlayerSystemCompendium(name, key, isMacro) {
        this.linkedCompendiumsPlayer.push( {name: name, key: key, isMacro: isMacro} );
    }

    async _addCompendiumsToList(actionList) {
        let actorType = game.user.isGM ? 'gm' : 'player';
        let systemCompendiums = game.user.isGM ? this.linkedCompendiumsGm : this.linkedCompendiumsPlayer;

        actionList.tokenId = actorType;
        actionList.actorId = actorType;

        await this._combineCompendiums(actionList, systemCompendiums);
    }

    async _combineCompendiums(actionList, compendiums) {
        for (let c of compendiums) {
            let entries = await this._getCompendiumEntries(c.name, c.key, c.isMacros);
            this._combineCategoryWithList(actionList, c.name, entries);
        }
    }
    
    async _getCompendiumEntries(categoryName, compendiumKey, isMacros) {
        let pack = game?.packs?.get(compendiumKey);
        if (!pack)
            return;

        let result = this.initializeEmptyCategory(compendiumKey);

        let macroType = isMacros ? 'macros' : 'compendium';            

        let packEntries = pack.index.length > 0 ? pack.index : await pack.getIndex();
        
        let entriesMap = packEntries.map(e => { 
            let encodedValue = [macroType, compendiumKey, e._id].join(this.delimiter);    
            return {name: e.name, encodedValue: encodedValue, id: e._id }
        });
        
        let entries = this.initializeEmptySubcategory();
        entries.actions = entriesMap;

        this._combineSubcategoryWithCategory(result, categoryName, entries);

        return result;
    }
}


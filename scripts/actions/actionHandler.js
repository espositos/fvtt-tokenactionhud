export class ActionHandler {    
    linkedCompendiumsGm = {};
    linkedCompendiumsPlayer = {};
    delimiter = '|';

    constructor() {
    }

    async buildActionList(token) {};

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

    initializeEmptySubcategory() {
        return {
            info: '',
            actions: [],
            subcategories: {}}
    }

    initializeEmptyActions() {
        return {actions: []};
    }

    initializeEmptyCategory() {
        return {subcategories: {}}
    }

    initializeEmptyActionList(){
        return { tokenId: '', actorId: '', categories: {}};
    }

    _combineCategoryWithList(result, categoryName, category) {
        if (!category)
            return;

        if (Object.entries(category.subcategories)?.length > 0)
            result.categories[categoryName] = category;
    }

    _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
        if (!subcategory)
            return;
            
        if (Object.entries(subcategory.actions)?.length > 0 || Object.entries(subcategory.subcategories)?.length > 0)
            category.subcategories[subcategoryName] = subcategory;
    }
    
    async _getCompendiumEntries(actorType, categoryName, compendiumKey, isMacros) {
        let macroType = 'compendium';
        if (isMacros)
            macroType = 'macrocompendium'
        let result = this.initializeEmptyCategory();
        let pack = game?.packs?.get(compendiumKey);

        if (!pack)
            return;

        let packEntries = pack.index.length > 0 ? pack.index : await pack.getIndex();

        let entriesMap = packEntries.map(e => { return {name: e.name, encodedValue: `${actorType}|${macroType}|${compendiumKey}|${e._id}`, id: e.id } })
        let entries = this.initializeEmptySubcategory();
        entries.actions = entriesMap;

        this._combineSubcategoryWithCategory(result, categoryName, entries);

        return result;
    }
}


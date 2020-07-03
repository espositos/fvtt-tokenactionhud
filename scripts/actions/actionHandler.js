export class ActionHandler {
    linkedCompendiumsGm = {
        macros: { key: 'world.token-action-hud.gm-macros', isMacros: true},
        journals: { key: 'world.token-action-hud.gm-journals', isMacros: false},
        tables: { key: 'world.token-action-hud.gm-tables', isMacros: false}
    };
    linkedCompendiumsPlayer = {
        macros: { key: 'world.token-action-hud.player-macros', isMacros: true},
        journals: { key: 'world.token-action-hud.player-journals', isMacros: false}
    };
    
    linkedSystemCompendiumsGm = {};
    linkedSystemCompendiumsPlayer = {};

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
        this.linkedSystemCompendiumsGm[name] = {key: key, isMacro: isMacro};
    }

    addPlayerSystemCompendium(name, key, isMacro) {
        this.linkedSystemCompendiumsPlayer[name] = {key: key, isMacro: isMacro};
    }

    async addCompendiums(actionList) {
        let actorType = game.user.isGM ? 'gm' : 'player';
        let hudCompendiums = game.user.isGM ? this.linkedCompendiumsGm : this.linkedCompendiumsPlayer;
        let systemCompendiums = game.user.isGM ? this.linkedSystemCompendiumsGm : this.linkedSystemCompendiumsPlayer;

        actionList.tokenId = actorType;
        actionList.actorId = actorType;

        await this._addCompendiums(actionList, actorType, hudCompendiums);
        await this._addCompendiums(actionList, actorType, systemCompendiums);
    }

    async _addCompendiums(actionList, actorType, compendiums) {
        console.log(compendiums);
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


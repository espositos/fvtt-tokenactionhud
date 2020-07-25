import {HudCompendium} from './hudCompendium.js';

export class CompendiumManager {
    categories = [];

    constructor(filterManager, actionHandler) {
        this.actionHandler = actionHandler;
        this.filterManager = filterManager;
    }

    addCategories(choices) {
        for (let choice of choices) {
            if (this.categories.some(c => c.id !== choice.id))
                this.createCategory(choice);
        }
    }

    createCategory(category) {
        let newCategory = { id: category.id, title: category.value, compendiums: [] };
        this.categories.push(newCategory);
    }

    addCompendiumsToCategory(categoryId, compendiums) {
        let category = this.categories.find(c => c.id === categoryId);

        compendiums.forEach(compendium => {
            this.addCompendiumToCategory(category, compendium)
        })

        category.compendiums.forEach(c => {
            if (compendiums.some(comp => comp.id === c.id)) {}
        })
    }

    addCompendiumToCategory(category, compendium) {
        if (!category.compendiums.some(c => c.id === compendium.id))
            category.compendiums.push(new HudCompendium(actionHandler, this, filterManager, compendium.id, compendium.value));
    }

    removeCategory(category) {
        let index = this.categories.indexOf(category);
        this.categories.splice(index, 1);
    }
    
    // static helpers
    static getCompendiumChoicesForFilter() {
        return game.packs.entries.filter(p => {
            let packTypes = ['JournalEntry', 'Macro', 'RollTable'];
            return packTypes.includes(p.metadata.entity);
        }).map(p => {return {id: p.key, value: p.metadata.label} });
    }

    async static getCompendiumEntries(key) {
        let pack = game?.packs?.get(key);
        if (!pack)
            return [];

        let packEntries = pack.index.length > 0 ? pack.index : await pack.getIndex();

        return packEntries;
    }

    async static getEntriesForActions(key) {
        let entries = await CompendiumManager.getCompendiumEntries(key);
        let macroType = CompendiumManager.getCompendiumMacroType(key);
        return entries.map(e => { 
            let encodedValue = [macroType, key, e._id].join(this.actionHandler.delimiter);
            return {name: e.name, encodedValue: encodedValue, id: e._id }
        });
    }

    static getCompendiumMacroType(key) {
        let pack = game?.packs?.get(key);
        if (!pack)
            return '';

        return pack.metadata.entity === 'Macro' ? 'macro': 'compendium';
    }

    async static getCompendiumEntriesForFilter(key) {
        let entries = await this.getCompendiumEntries(key);

        return entries.map(e => {return {value:e.name, id: e._id}});
    }
}
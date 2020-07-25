
export class CompendiumHelper {
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
        let entries = await CategoryManager.getCompendiumEntries(key);
        let macroType = CategoryManager.getCompendiumMacroType(key);
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
export class CompendiumHelper {
    constructor() {}

    static getCompendiumChoicesForFilter() {
        return game.packs.entries.filter(p => {
            let packTypes = ['JournalEntry', 'Macro', 'RollTable'];
            return packTypes.includes(p.metadata.entity);
        }).map(p => {
            let key = `${p.metadata.package}.${p.metadata.name}`
            return {id: key, value: p.metadata.label} });
    }

    static exists(key) {
        return !!game.packs.get(key);
    }

    static async getEntriesForActions(key, delimiter) {
        let entries = await CompendiumHelper.getCompendiumEntries(key);
        let macroType = CompendiumHelper.getCompendiumMacroType(key);
        return entries.map(e => { 
            let encodedValue = [macroType, key, e._id].join(delimiter);
            return {name: e.name, encodedValue: encodedValue, id: e._id }
        });
    }

    static getCompendiumMacroType(key) {
        let pack = game?.packs?.get(key);
        if (!pack)
            return '';

        return pack.metadata.entity === 'Macro' ? 'macro': 'compendium';
    }

    static async getCompendiumEntriesForFilter(key) {
        let entries = await CompendiumHelper.getCompendiumEntries(key);

        return entries.map(e => {return {value: e.name, id: e._id}});
    }

    static async getCompendiumEntries(key) {
        let pack = game.packs.get(key);
        if (!pack)
            return [];

        let packEntries = pack.index.length > 0 ? pack.index : await pack.getIndex();

        return packEntries;
    }
}
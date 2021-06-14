import * as settings from '../../settings.js';

export class CompendiumHelper {
    constructor() {}

    static getCompendiumChoicesAsTagifyEntries() {        
        const packs = 'filter' in game.packs.entries ? game.packs.entries : game.packs;

        return packs.filter(p => {
            let packTypes = ['JournalEntry', 'Macro', 'RollTable', 'Playlist'];
            return packTypes.includes(p.metadata.entity);
        }).filter(p => game.user.isGM || !p.private).map(p => {
            let key = `${p.metadata.package}.${p.metadata.name}`
            return {id: key, value: p.metadata.label, type: 'comp'} });
    }

    static exists(key) {
        return !!game.packs.get(key);
    }

    static async getEntriesForActions(key, delimiter) {
        let entries = await CompendiumHelper.getCompendiumEntries(key);
        let macroType = CompendiumHelper.getCompendiumMacroType(key);
        return entries.map(e => { 
            let encodedValue = [macroType, key, e._id].join(delimiter);
            let img = CompendiumHelper.getImage(e);
            return {name: e.name, encodedValue: encodedValue, id: e._id, img: img }
        });
    }

    static getCompendiumMacroType(key) {
        let pack = game?.packs?.get(key);
        if (!pack)
            return '';
        let compendiumEntities = pack.metadata.entity;

        switch (compendiumEntities) {
            case 'Macro':
                return 'compendiumMacro';
            case 'Playlist':
                return 'compendiumPlaylist';
            default:
                return 'compendiumEntry';
        }
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

        if (pack.metadata.entity === 'Playlist') {
            let entries = await CompendiumHelper._getPlaylistEntries(pack);
            return entries;
        }

        return packEntries;
    }

    static async _getPlaylistEntries(pack) {
        let playlists = await pack.getContent();
        return playlists.reduce((acc, playlist) => {
            playlist.sounds.forEach(s => {
                acc.push({_id: `${playlist._id}>${s._id}`, name: s.name});
            })
            return acc;
        }, [])
    }

    static getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }
}
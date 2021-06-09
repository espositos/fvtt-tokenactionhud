import * as settings from '../../settings.js';

export class MacroHelper {
    constructor() {}

    static exists(key, macros) {
        if (!!macros) {
            return macros.some(m => m.data._id === key);
        }
        
        const macroEntries = 'some' in game.macros.entries ? game.macros.entries : game.macros;

        return !!macroEntries.some(m => m.data._id === key);
    }

    static getEntriesForActions(delimiter) {
        let macroType = 'macro';
        let entries = MacroHelper.getMacros();
        return entries.map(m => {
            let encodedValue = [macroType, macroType, m.data._id].join(delimiter);
            let img = MacroHelper.getImage(m);
            return { name: m.data.name, encodedValue: encodedValue, id: m.data._id, img: img }
        });
    }

    static getMacrosForFilter() {
        return MacroHelper.getMacros().map(m => {
            return {id: m.data._id, value: m.data.name}
        });
    }

    static getMacros() {
        const macros = 'filter' in game.macros.entries ? game.macros.entries : game.macros;

        return macros.filter(m => {
            let permissions = m.data.permission;
            if (permissions[game.userId])
                return permissions[game.userId] > 0;
            
            return permissions.default > 0;
        });
    }

    static getImage(macro) {
        let result = '';
        if (settings.get('showIcons'))
            result = macro.data.img;

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }
}
export class MacroHelper {
    constructor() {}

    static exists(key) {
        return !!game.macros.entries.some(m => m.data._id === key);
    }

    static getEntriesForActions(delimiter) {
        let macroType = 'macro';
        let entries = MacroHelper.getMacros();
        return entries.map(m => { 
            let encodedValue = [macroType, key, m.data._id].join(delimiter);
            return {name: m.data.name, encodedValue: encodedValue, id: m.data._id }
        });
    }

    static getMacrosForFilter() {
        return MacroHelper.getMacros().map(m => {
            return {id: m.data._id, value: m.data.name}
        });
    }

    static getMacros() {
        return game.macros.entries.filter(m => {
            let permissions = m.data.permission;
            if (permissions[game.userId])
                return permissions[game.userId] > 0;
            
            return permissions.default > 0;
        });
    }
}
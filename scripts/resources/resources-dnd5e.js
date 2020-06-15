const localize = (string) => game.i18n.localize(string);

export class ResourceBuilder5e {
    buildResourceList(actor) {
        if (actor === null || actor === undefined) {
            return {};
        }
        
        let result = this._getResourcesList(actor);

        return result;
    }

    /** @private */
    _getResourcesList(actor) {
        let result = {};

        let resources = actor.data.data.resources;

        if (!resources)
            return {};

        for (let [k, v] of Object.entries(resources)) {
            let name = "";

            if (k === 'legact') {
                name = localize('DND5E.LegAct');
            } else if (k === 'legres') {
                name = localize('DND5E.LegRes');
            } else if (k === 'lairact') {
                name = localize('DND5E.LairAct');
            } else if (k === 'primary' || k === 'secondary' || k === 'tertiary') {
                name = k.charAt(0).toUpperCase() + k.slice(1) + ' resource';
            } else if (v.label && v.label !== '') {
                name = v.label;
            } else {
                name = 'Resource ' + ( Object.keys(resources).indexOf(k) + 1 );
            }

            if (v.value || v.max)
                result[name] = {'value': v.value, 'max': v.max};
        }

        return result;
    }
}
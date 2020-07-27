import {Filter} from './filter.js';
import * as settings from '../../settings.js';

export class FilterManager {
    filters = [];
    user = null;

    constructor(user) {
        this.user = user;

        let savedFilters = user.getFlag('token-action-hud', 'filters');
        if (!savedFilters)
            return;

        settings.Logger.debug('saved filters:', savedFilters);

        Object.entries(savedFilters).forEach(f => {
            let filter = new Filter(f[0]);
            filter.setFilteredElements(f[1].elements, f[1].isBlocklist);
            this.filters.push(filter);
        })
    }

    createOrGetFilter(filterId) {
        if (this.filters.some(f => f.id === filterId))
            return this.filters.find(f => f.id);

        let filter = new Filter(filterId);
        this.filters.push(filter);
        return filter;
    }

    setCanFilter(category) {
        if (this.filters.some(f => f.id === category.id))
            category.canFilter = true;
    }

    getSuggestions(filterId) {
        let filter = this._getFilter(filterId);

        return filter.getSuggestions();
    }

    setSuggestions(filterId, choices) {
        let filter = this._getFilter(filterId);

        filter.setSuggestions(choices);
    }

    getFilteredElements(filterId) {
        let filter = this._getFilter(filterId);
        
        return filter.getFilteredElements();
    }

    getFilteredNames(filterId) {
        let filter = this._getFilter(filterId);
        
        return filter.getFilteredNames();
    }

    getFilteredIds(filterId) {
        let filter = this._getFilter(filterId);
        
        return filter.getFilteredIds();
    }

    setFilteredElements(filterId, elements, isBlocklist) {
        let filter = this._getFilter(filterId);

        let blocklist = isBlocklist === 1 ? true : false;

        let flag = {isBlocklist: blocklist, elements: elements}
        this.user.setFlag('token-action-hud', `filters.${filterId}`, flag)
        
        filter.setFilteredElements(elements, isBlocklist);
    }

    async clearFilter(filterId) {
        let filter = this.filters.find(f => f.id === filterId);

        if (!filter)
            return;

        this.user.setFlag('token-action-hud', 'filters', {[`-=${filterId}`]: null})
        this.filters.splice(this.filters.indexOf(filter), 1);
    }

    isBlocklist(filterId) {
        let filter = this._getFilter(filterId);

        return filter.isBlocklist;
    }

    _getFilter(filterId) {
        return this.filters.find(f => f.id === filterId) ?? this.createOrGetFilter(filterId);
    }

    getCompendiumChoices() {
        let choices = game.packs.entries.filter(p => {
            let packTypes = ['JournalEntry', 'Macro', 'RollTable'];
            return packTypes.includes(p.metadata.entity);
        }).map(p => {return {id: `${p.metadata.package}.${p.metadata.name}`, value: p.metadata.label} });

        return choices;
    }

    getChosenCompendiums() {
        let compendiums = this.getCompendiumChoices();
        let filterIds = this.filters.map(f => f.id);
        return compendiums.filter(c => filterIds.includes(c.id))
    }

    async setCompendiums(compendiums) {
        for (let c of compendiums) {
            let filter = this._getFilter(c.id);
            let pack = game.packs.get(c.id);
            let index = pack.index.length > 0 ? pack.index : await pack.getIndex();
            let suggestions = index.map(e => {return {id: e.id, value: e.name}})
            this.setSuggestions(filter.id, suggestions);
        }
    }
}
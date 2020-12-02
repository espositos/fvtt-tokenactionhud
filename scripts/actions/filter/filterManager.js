import {Filter} from './filter.js';
import {Logger} from '../../logger.js';

export class FilterManager {
    filters = [];
    user = null;

    constructor(user) {
        this.user = user;

        let savedFilters = user.getFlag('token-action-hud', 'filters');
        if (!savedFilters)
            return;

        Logger.debug('saved filters:', savedFilters);

        Object.entries(savedFilters).forEach(f => {
            let filter = new Filter(f[0]);
            filter.setFilteredElements(f[1].elements, f[1].isBlocklist);
            this.filters.push(filter);
        })
    }

    async reset() {
        this. filters = [];
        await game.user.unsetFlag('token-action-hud', 'filters');
    }

    createOrGetFilter(filterId) {
        if (this.filters.some(f => f.id === filterId))
            return this.filters.find(f => f.id);

        let filter = new Filter(filterId);
        this.filters.push(filter);
        return filter;
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

    async setFilteredElements(filterId, elements, isBlocklist) {
        let filter = this._getFilter(filterId);        
        await filter.setFilteredElements(elements, isBlocklist);
    }

    async clearFilter(filterId) {
        let filter = this.filters.find(f => f.id === filterId);

        if (!filter)
            return;

        await filter.clearFlag();
        
        this.filters.splice(this.filters.indexOf(filter), 1);
    }

    isBlocklist(filterId) {
        let filter = this._getFilter(filterId);

        return filter.isBlocklist;
    }

    _getFilter(filterId) {
        return this.filters.find(f => f.id === filterId) ?? this.createOrGetFilter(filterId);
    }
}
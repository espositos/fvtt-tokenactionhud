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

    createFilter(filterId) {
        if (!this.filters.some(f => f.id === filterId)) {
            let filter = new Filter(filterId);
            this.filters.push(filter);
        }

        return this;
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

    isBlocklist(filterId) {
        let filter = this._getFilter(filterId);

        return filter.isBlocklist;
    }

    _getFilter(filterId) {
        return this.filters.find(f => f.id === filterId) ?? new Filter();
    }
}
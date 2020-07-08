import {Filter} from './filter.js';

export class FilterManager {
    filters = [];
    user = null;

    constructor(user) {
        this.user = user;

        let savedFilters = user.getFlag('token-action-hud', 'filters');

        Object.entries(savedFilters).forEach(f => {
            let filter = new Filter(f[0]);
            filter.setFilterElements(f[1].elements, f[1].isBlocklist);
            this.filters.push(filter);
        })
    }

    createFilter(filterId) {
        if (!this.filters.some(f => f.id === filterId)) {
            this.filters.push(new Filter(filterId));
        }
    }

    getFilterChoices(filterId) {
        let filter = this._getFilter(filterId);

        return filter.getChoices();
    }

    setFilterChoices(filterId, choices) {
        let filter = this._getFilter(filterId);

        filter.setFilterChoices(filterId, choices);
    }

    getFilterElements(filterId) {
        let filter = this._getFilter(filterId);
        
        return filter.getFilterElements();
    }

    setFilterElements(filterId, elements, isBlocklist) {
        let filter = this._getFilter(filterId);

        let flag = {isBlocklist: isBlocklist, elements: elements}
        this.user.setFlag(`token-action-hud.filters.${filterId}`, flag)
        
        filter.setFilterElements(elements, isBlocklist);
    }

    isBlocklist(filterId) {
        let filter = this._getFilter(filterId);

        return filter.isBlocklist();
    }

    _getFilter(filterId) {
        return this.filters.find(f => f.id === filterId) ?? new Filter();
    }
}
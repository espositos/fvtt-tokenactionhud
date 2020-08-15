export class Filter {
    id = '';
    isBlocklist = false;
    filteredElements = [];
    possibleChoices = [];

    constructor(id) {
        this.id = id;
    }

    setFilteredElements(elements, isBlocklist) {
        if (Array.isArray(elements)) {
            this.filteredElements = elements;
            this.isBlocklist = isBlocklist;
        }

        this.updateFlag();
    }

    getSuggestions() {
        return this.possibleChoices;
    }

    getFilteredElements() {
        return this.filteredElements;
    }

    getFilteredNames() {
        let result = this.filteredElements.map(f => f.value)
        return result;
    }

    getFilteredIds() {
        let result = this.filteredElements.map(f => f.id)
        return result;
    }

    setSuggestions(choices) {
        if (Array.isArray(choices))
            this.possibleChoices = choices;
    }

    async updateFlag() {
        let flag = {isBlocklist: this.isBlocklist, elements: this.filteredElements}
        game.user.setFlag('token-action-hud', `filters.${this.id}`, flag)
    }

    async clearFlag() {
        game.user.setFlag('token-action-hud', 'filters', {[`-=${this.id}`]: null})    
    }
}
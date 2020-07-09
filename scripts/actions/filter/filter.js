export class Filter {
    id = '';
    isBlocklist = false;
    filteredElements = [];
    choices = [];

    constructor(id) {
        this.id = id;
    }

    setFilteredElements(elements, isBlocklist) {
        if (Array.isArray(elements)) {
            this.filteredElements = elements;
            this.isBlocklist = isBlocklist;
        }
    }

    getSuggestions() {
        return this.choices;
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
            this.choices = choices;
    }
}
export class Filter {
    id = '';
    isBlocklist = false;
    filteredElements = [];
    choices = [];

    constructor(id) {
        this.id = id;
    }

    isBlocklist() {
        return this.isBlocklist;
    }


    setFilterElements(elements, isBlocklist) {
        if (Array.isArray(elements)) {
            this.filteredElements = elements;
            this.isBlocklist = isBlocklist;
        }
    }

    getFilterElements() {
        return this.filteredElements;
    }

    setChoices(choices) {
        if (Array.isArray(choices))
            this.choices = choices;
    }

    getChoices() {
        return this.choices;
    }
}
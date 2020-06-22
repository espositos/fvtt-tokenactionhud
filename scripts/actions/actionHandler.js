export class ActionHandler {
    constructor() {}

    buildActionList(token) {};

    initializeEmptySubcategory() {
        return {
            info: '',
            actions: {},
            subcategories: {}}
    }

    initializeEmptyActions() {
        return {actions: []};
    }

    initializeEmptyCategory() {
        return {subcategories: {}}
    }

    initializeEmptyActionList(){
        return { tokenId: '', actorId: '', categories: {}};
    }
}


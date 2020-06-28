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

    _combineCategoryWithList(result, categoryName, category) {
        if (Object.entries(category.subcategories).length > 0)
            result.categories[categoryName] = category;
    }

    _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
        if (Object.entries(subcategory.actions).length > 0)
            category.subcategories[subcategoryName] = subcategory;
    }
}


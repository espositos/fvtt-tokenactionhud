export class ActionHandler {
    constructor() {}

    async buildActionList(token) {};

    initializeEmptySubcategory() {
        return {
            info: '',
            actions: [],
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
        if (!category)
            return;

        if (Object.entries(category.subcategories)?.length > 0)
            result.categories[categoryName] = category;
    }

    _combineSubcategoryWithCategory(category, subcategoryName, subcategory) {
        if (!subcategory)
            return;
            
        if (Object.entries(subcategory.actions)?.length > 0 || Object.entries(subcategory.subcategories)?.length > 0)
            category.subcategories[subcategoryName] = subcategory;
    }
}


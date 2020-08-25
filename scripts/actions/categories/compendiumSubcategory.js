import { CompendiumHelper } from './compendiumHelper.js';
import { SubcategoryType } from '../../enums/subcategoryType.js';
import { FilterSubcategory } from './filterSubcategory.js';

export class CompendiumSubcategory extends FilterSubcategory {
    constructor(filterManager, categoryId, compendiumId, title) {
        super(filterManager, title);
        this.id = `${categoryId}_${compendiumId}`.slugify({replacement: '_', strict:true});
        this.compendiumId = compendiumId;
        this.type = SubcategoryType.COMPENDIUM;
    }

    async submitFilterSuggestions() {
        let suggestions = await CompendiumHelper.getCompendiumEntriesForFilter(this.compendiumId);
        this.filterManager.setSuggestions(this.id, suggestions);
    }

    /** @override */
    async _getActions(delimiter) {
        let packEntries = await CompendiumHelper.getEntriesForActions(this.compendiumId, delimiter);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        let actions = packEntries;

        if (filters.length > 0)
            actions = packEntries.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return actions;
    }

    /** @override */
    getFlagContents() {
        return {id: this.compendiumId, title: this.title, type: this.type};
    }
}
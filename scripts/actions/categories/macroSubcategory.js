import { MacroHelper } from './macroHelper.js';
import { SubcategoryType } from '../../enums/subcategoryType.js';
import { FilterSubcategory } from './filterSubcategory.js';

export class MacroSubcategory extends FilterSubcategory {
    constructor(filterManager, categoryKey, title) {
        super(filterManager, title);
        this.id = `${categoryKey}_${title}`.slugify({replacement: '_', strict:true});
        this.type = SubcategoryType.MACRO;
    }
    
    submitFilterSuggestions() {
        let suggestions = MacroHelper.getMacrosForFilter();
        this.filterManager.setSuggestions(this.id, suggestions);
    }

    /** @override */
    _getActions(delimiter) {
        let possibleMacros = MacroHelper.getEntriesForActions(delimiter);

        let filters = this.filterManager.getFilteredIds(this.id);
        let isBlocklist = this.filterManager.isBlocklist(this.id);
      
        if (filters.length === 0)
            return [];

        let filteredActions = possibleMacros.filter(p => filters.includes(p.id) !== isBlocklist)
        
        return filteredActions;
    }
}
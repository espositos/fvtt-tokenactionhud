import {TagDialog} from '../tagDialog.js';

export class TagDialogHelper {
    static showFilterDialog(filterManager, categoryId) {
        TagDialogHelper.showActionFilterDialog(filterManager, categoryId);
    }

    static showCompendiumDialog(compendiumManager, categoryId) {
        TagDialogHelper.showCompendiumDialog(categoryId, compendiumManager);
    }

    static showCategoryDialog(compendiumManager) {
        TagDialogHelper.showCategoryDialog(compendiumManager);
    }

    static async submitCategories(compendiumManager, choices, push) {
        await compendiumManager.submitCategories(choices, push);
        game.tokenActionHUD.update()
    }

    static async submitCompendiums(compendiumManager, categoryId, choices) {
        await compendiumManager.submitCompendiums(categoryId, choices);
        game.tokenActionHUD.update();
    }

    static async submitFilter(filterManager, categoryId, elements, isBlocklist) {
        await filterManager.setFilteredElements(categoryId, elements, isBlocklist);
        game.tokenActionHUD.update();
    }
    
    // Currently only used for WFRP skill filter
    static showActionFilterDialog(filterManager, categoryId) {
        let suggestions = filterManager.getSuggestions(categoryId);
        let selected = filterManager.getFilteredElements(categoryId);

        let title = this.i18n('tokenactionhud.filterTagTitle');
        
        let hbsData = {
            topLabel: this.i18n('tokenactionhud.categoryTagTitle'),
            placeholder: this.i18n('tokenactionhud.tagifyPlaceholder'),
            clearButtonText: this.i18n('tokenactionhud.filterPlaceholder'),
            indexExplanationLabel: this.localize('tokenactionhud.blocklistLabel'),
            index: [
                {value: 0, text: this.i18n('tokenactionhud.allowlist')},
                {value: 1, text: this.i18n('tokenactionhud.blocklist')}
            ]
        }

        let submitFunc = (choices, indexValue) => {
            let isBlocklist = parseInt(indexValue) != 0 ? true : false;
            game.tokenActionHUD.submitFilters(categoryId, categoryId, isBlocklist);
        }

        this.showDialog(suggestions, selected, title, hbsData, submitFunc);
    }
    
    static showCompendiumDialog(categoryId, compendiumManager) {
        let suggestions = CompendiumHelper.getCompendiumChoicesForFilter();
        let selected = compendiumManager.getCategoryCompendiumsAsTagifyEntries(categoryId);

        let title = this.i18n('tokenactionhud.compendiumTagTitle');
        
        let hbsData = {
            topLabel: this.i18n('tokenactionhud.compendiumTagTitle'),
            placeholder: this.i18n('tokenactionhud.tagifyPlaceholder'),
            clearButtonText: this.i18n('tokenactionhud.filterPlaceholder'),
        }

        let submitFunc = (choices, indexValue) => {
            game.tokenActionHUD.submitCompendiums(categoryId, choices);
        }

        this.showDialog(suggestions, selected, title, hbsData, submitFunc);
    }

    static showCategoryDialog(compendiumManager) {
        let selected = compendiumManager.getExistingCategories();

        let title = this.i18n('tokenactionhud.categoryTagTitle');
        
        let hbsData = {
            topLabel: this.i18n('tokenactionhud.categoryTagTitle'),
            placeholder: this.i18n('tokenactionhud.tagifyPlaceholder'),
            clearButtonText: this.i18n('tokenactionhud.filterPlaceholder'),
            indexExplanationLabel: this.i18n('tokenactionhud.pushLabelExplanation'),
            index: [
                {value: 0, text: this.i18n('tokenactionhud.unshift')},
                {value: 1, text: this.i18n('tokenactionhud.push')}
            ]
        }

        let template = Handlebars.dosomething(hbsData, template);

        let submitFunc = (choices, indexValue) => {
            let push = parseInt(indexValue) != 0 ? true : false;
            game.tokenActionHUD.submitCategories(choices, push);
        }

        this.showDialog(null, selected, title, hbsData, submitFunc);
    }


}
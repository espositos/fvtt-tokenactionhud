import {TagDialog} from '../tagDialog.js';
import { CompendiumHelper } from '../actions/categories/compendiumHelper.js';

export class TagDialogHelper {
    
    static showFilterDialog(filterManager, categoryId) {
        TagDialogHelper._showFilterDialog(filterManager, categoryId);
    }

    static showCompendiumDialog(categoryManager, categoryId, categoryName) {
        TagDialogHelper._showCompendiumDialog(categoryManager, categoryId, categoryName);
    }

    static showCategoryDialog(categoryManager) {
        TagDialogHelper._showCategoryDialog(categoryManager);
    }

    static async submitCategories(categoryManager, choices, push) {
        await categoryManager.submitCategories(choices, push);
        game.tokenActionHUD.update()
    }

    static async submitSubcategories(categoryManager, categoryId, choices) {
        await categoryManager.submitSubcategories(categoryId, choices);
        game.tokenActionHUD.update();
    }

    static async submitFilter(filterManager, categoryId, elements, isBlocklist) {
        await filterManager.setFilteredElements(categoryId, elements, isBlocklist);
        game.tokenActionHUD.update();
    }
    
    // Currently only used for WFRP skill filter
    static _showFilterDialog(filterManager, categoryId) {
        let suggestions = filterManager.getSuggestions(categoryId);
        let selected = filterManager.getFilteredElements(categoryId);
        let indexChoice = filterManager.isBlocklist(categoryId) ? 1 : 0;

        let title = game.i18n.localize('tokenactionhud.filterTitle');
        
        let hbsData = {
            topLabel: game.i18n.localize('tokenactionhud.filterTagExplanation'),
            placeholder: game.i18n.localize('tokenactionhud.filterPlaceholder'),
            clearButtonText: game.i18n.localize('tokenactionhud.clearButton'),
            indexExplanationLabel: game.i18n.localize('tokenactionhud.blocklistLabel'),
            index: [
                {value: 0, text: game.i18n.localize('tokenactionhud.allowlist')},
                {value: 1, text: game.i18n.localize('tokenactionhud.blocklist')}
            ]
        }

        let submitFunc = (choices, indexValue) => {
            let isBlocklist = parseInt(indexValue) != 0 ? true : false;
            TagDialogHelper.submitFilter(filterManager, categoryId, choices, isBlocklist);
        }

        TagDialog.showDialog(suggestions, selected, indexChoice, title, hbsData, submitFunc);
    }
    
    static _showCompendiumDialog(categoryManager, categoryId, categoryName) {
        let suggestions = CompendiumHelper.getCompendiumChoicesAsTagifyEntries();
        let selected = categoryManager.getCategorySubcategoriesAsTagifyEntries(categoryId);

        let title = game.i18n.localize('tokenactionhud.subcategoryTagTitle') + ` (${categoryName})`;
        
        let hbsData = {
            topLabel: game.i18n.localize('tokenactionhud.subcategoryTagExplanation'),
            placeholder: game.i18n.localize('tokenactionhud.filterPlaceholder'),
            clearButtonText: game.i18n.localize('tokenactionhud.clearButton'),
        }

        let submitFunc = (choices, indexValue) => {
            let subcats = choices.map(c => {return {id: c.id, title: c.value, type: c.type}})
            TagDialogHelper.submitSubcategories(categoryManager, categoryId, subcats);
        }

        TagDialog.showDialog(suggestions, selected, null, title, hbsData, submitFunc);
    }

    static _showCategoryDialog(categoryManager) {
        let selected = categoryManager.getExistingCategories();

        let indexChoice = categoryManager.arePush() ? 1 : 0;

        let title = game.i18n.localize('tokenactionhud.categoryTagTitle');
        
        let hbsData = {
            topLabel: game.i18n.localize('tokenactionhud.categoryTagExplanation'),
            placeholder: game.i18n.localize('tokenactionhud.filterPlaceholder'),
            clearButtonText: game.i18n.localize('tokenactionhud.clearButton'),
            indexExplanationLabel: game.i18n.localize('tokenactionhud.pushLabelExplanation'),
            index: [
                {value: 0, text: game.i18n.localize('tokenactionhud.unshift')},
                {value: 1, text: game.i18n.localize('tokenactionhud.push')}
            ]
        }

        let submitFunc = (choices, indexValue) => {
            let push = parseInt(indexValue) != 0 ? true : false;
            TagDialogHelper.submitCategories(categoryManager, choices, push);
        }

        TagDialog.showDialog(null, selected, indexChoice, title, hbsData, submitFunc);
    }


}
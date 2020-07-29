import {TagDialog} from '../tagDialog.js';
import { CompendiumHelper } from '../actions/compendiums/compendiumHelper.js';

export class TagDialogHelper {
    
    static showFilterDialog(filterManager, categoryId) {
        TagDialogHelper._showFilterDialog(filterManager, categoryId);
    }

    static showCompendiumDialog(compendiumManager, categoryId) {
        TagDialogHelper._showCompendiumDialog(compendiumManager, categoryId);
    }

    static showCategoryDialog(compendiumManager) {
        TagDialogHelper._showCategoryDialog(compendiumManager);
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
    static _showFilterDialog(filterManager, categoryId) {
        let suggestions = filterManager.getSuggestions(categoryId);
        let selected = filterManager.getFilteredElements(categoryId);
        let indexChoice = filterManager.isBlocklist(categoryId) ? 1 : 0;

        let title = game.i18n.localize('tokenactionhud.filterTagTitle');
        
        let hbsData = {
            topLabel: game.i18n.localize('tokenactionhud.categoryTagTitle'),
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
            TagDialogHelper.submitFilters(categoryId, categoryId, isBlocklist);
        }

        TagDialog.showDialog(suggestions, selected, indexChoice, title, hbsData, submitFunc);
    }
    
    static _showCompendiumDialog(compendiumManager, categoryId) {
        let suggestions = CompendiumHelper.getCompendiumChoicesForFilter();
        let selected = compendiumManager.getCategoryCompendiumsAsTagifyEntries(categoryId);

        let title = game.i18n.localize('tokenactionhud.compendiumTagTitle');
        
        let hbsData = {
            topLabel: game.i18n.localize('tokenactionhud.compendiumTagTitle'),
            placeholder: game.i18n.localize('tokenactionhud.filterPlaceholder'),
            clearButtonText: game.i18n.localize('tokenactionhud.clearButton'),
        }

        let submitFunc = (choices, indexValue) => {
            let compendiums = choices.map(c => {return {id: c.id, title: c.value}})
            TagDialogHelper.submitCompendiums(compendiumManager, categoryId, compendiums);
        }

        TagDialog.showDialog(suggestions, selected, null, title, hbsData, submitFunc);
    }

    static _showCategoryDialog(compendiumManager) {
        let selected = compendiumManager.getExistingCategories();

        let indexChoice = compendiumManager.arePush() ? 1 : 0;

        let title = game.i18n.localize('tokenactionhud.categoryTagTitle');
        
        let hbsData = {
            topLabel: game.i18n.localize('tokenactionhud.categoryTagTitle'),
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
            TagDialogHelper.submitCategories(compendiumManager, choices, push);
        }

        TagDialog.showDialog(null, selected, indexChoice, title, hbsData, submitFunc);
    }


}
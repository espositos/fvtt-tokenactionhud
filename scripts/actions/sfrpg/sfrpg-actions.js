import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerSfrpg extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    doBuildActionList(token) {
        let actionList = this.initializeEmptyActionList();

        if (!token)
            return actionList;

        let tokenId = token.data._id;

        actionList.tokenId = tokenId;

        let actor = token.actor;

        if (!actor)
            return actionList;

        actionList.actorId = actor._id;

        actionList = this._buildItemCategory(token, actionList);
        actionList = this._buildSpellsCategory(token, actionList);
        actionList = this._buildFeatsCategory(token, actionList);
        actionList = this._buildSkillCategory(token, actor, actionList);
        actionList = this._buildAbilitiesCategory(token, actionList);
        actionList = this._buildSavesCategory(token, actionList);

        settings.Logger.debug('SFRPG ActionList:', actionList);
        
        return actionList;
    }

    _buildItemCategory(token, actionList){

        var itemList = token.actor.data.items;
        let tokenId = token.data._id;

        var itemsCategoryName = this.i18n('tokenactionhud.equipment');
        var itemsMacroType = "item";
        let itemsCategory = this.initializeEmptyCategory(itemsCategoryName);
        
        itemsCategory = this._addSubcategoryByType(this.i18n('tokenactionhud.weapons'), "weapon",itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByType(this.i18n('tokenactionhud.consumables'), "consumable",itemsMacroType, itemList, tokenId, itemsCategory);

        this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
    
        return actionList;
    }

    _buildFeatsCategory(token, actionList){

        var itemList = token.actor.data.items.filter(item => item.type == "feat");
        let tokenId = token.data._id;

        var itemsCategoryName = this.i18n('tokenactionhud.features');
        var itemsMacroType = "feat";
        let itemsCategory = this.initializeEmptyCategory(itemsCategoryName);
        
        console.log(itemList.map(item => item.data.actionType));

        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.mwa'), "mwak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.rwa'), "rwak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.msa'), "msak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.rsa'), "rsak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.healing'), "heal", itemsMacroType, itemList, tokenId, itemsCategory);

        this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
    
        return actionList;


    }
  
    _buildSpellsCategory(token, actionList){

        var itemList = token.actor.data.items.filter(item => item.type == "spell");
        let tokenId = token.data._id;

        var categoryName = this.i18n('tokenactionhud.spellbook');
        var macroType = "spell";
        let category = this.initializeEmptyCategory(categoryName);

        var maxLevel = 6;
        
        for (let level = 0; level < maxLevel; level++) {
            category = this._addSubcategoryByLevel(`${this.i18n('tokenactionhud.level')} ` + level, level, macroType, itemList, tokenId, category);
            
        }

        this._combineCategoryWithList(actionList, categoryName, category);
    
        return actionList;
    }        

    /** @private */
    _buildSkillCategory(token, actor, actionList) {
        let category = this.initializeEmptyCategory('skills');
        let macroType = 'skill';
        
        let skillsActions = Object.entries(CONFIG.SFRPG.skills).map(e => {
            let name = e[1];
            let encodedValue = [macroType, token.data._id, e[0]].join(this.delimiter);
            let icon = this._getClassSkillIcon(actor.data.data.skills[e[0]].value)
            return { name: name, id: e[0], encodedValue: encodedValue, icon: icon };
        });
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillsActions;

        let skillsTitle = this.i18n('tokenactionhud.skills');
        this._combineSubcategoryWithCategory(category, skillsTitle, skillsCategory);
        this._combineCategoryWithList(actionList, skillsTitle, category);

        return actionList;
    }      

    /** @private */
    _buildAbilitiesCategory(token, actionList) {
        let category = this.initializeEmptyCategory('abilities');
        let macroType = 'ability';
        
        let abilitiesActions = Object.entries(CONFIG.SFRPG.abilities).map(e => {
            let name = e[1];
            let encodedValue = [macroType, token.data._id, e[0]].join(this.delimiter);
            return { name: name, id: e[0], encodedValue: encodedValue }; 
        });
        let abilitiesCategory = this.initializeEmptySubcategory();
        abilitiesCategory.actions = abilitiesActions;

        let abilitiesTitle = this.i18n('tokenactionhud.abilities');
        this._combineSubcategoryWithCategory(category, abilitiesTitle, abilitiesCategory);
        this._combineCategoryWithList(actionList, abilitiesTitle, category);

        return actionList;
    }      

    /** @private */
    _buildSavesCategory(token, actionList) {
        let category = this.initializeEmptyCategory('saves');
        let macroType = 'save';
        
        let saveActions = Object.entries(CONFIG.SFRPG.saves).map(e => {
            let name = e[1];
            let encodedValue = [macroType, token.data._id, e[0]].join(this.delimiter);
            return { name: name, id: e[0], encodedValue: encodedValue }; 
        });
        let savesCategory = this.initializeEmptySubcategory();
        savesCategory.actions = saveActions;

        let savesTitle = this.i18n('tokenactionhud.saves');
        this._combineSubcategoryWithCategory(category, savesTitle, savesCategory);
        this._combineCategoryWithList(actionList, savesTitle, category);

        return actionList;
    }

    _addSubcategoryByActionType(subCategoryName, actionType, macroType, itemList, tokenId, category){
        
        
        let subCategory = this.initializeEmptySubcategory();    

        let itemsOfType = itemList.filter(item => item.data.actionType == actionType);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    
    _addSubcategoryByType(subCategoryName, type, macroType, itemList, tokenId, category){
        
        let subCategory = this.initializeEmptySubcategory();    

        let itemsOfType = itemList.filter(item => item.type == type);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    _addSubcategoryByLevel(subCategoryName, level, macroType, itemList, tokenId, category){
        
        let subCategory = this.initializeEmptySubcategory();    

        let itemsOfType = itemList.filter(item => item.data.level == level);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    _buildItemAction(tokenId, macroType, item) {
        let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
        let img = this._getImage(item);
        let result = { name: item.name, id: item._id, encodedValue: encodedValue, img:img }
        
        return result;
    }
    
    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }

    _getClassSkillIcon(level) {
        const icons = {
            3: '<i class="fas fa-check"></i>'
        };

        return icons[level];
    }
}
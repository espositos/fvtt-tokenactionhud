import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerSfrpg extends ActionHandler {
    constructor (filterManager) {
        super(filterManager);
    }

    /** @override */
    async buildActionList(token, filters) {
        let actionList = this.initializeEmptyActionList();

        if (!token)
            return actionList;

        let tokenId = token.data._id;

        actionList.tokenId = tokenId;

        let actor = token.actor;

        if (!actor){
            return actionList;
        }

        actionList.actorId = actor._id;

        actionList = this._buildItemCategory(token, actionList);
        actionList = this._buildSpellsCategory(token, actionList);
        actionList = this._buildFeatsCategory(token, actionList);

        console.log(actionList);

        return actionList;
    }

    _buildItemCategory(token, actionList){


        var itemList = token.actor.data.items;
        let tokenId = token.data._id;

        var itemsCategoryName = "Equipment";
        var itemsMacroType = "item";
        let itemsCategory = this.initializeEmptyCategory(itemsCategoryName);
        
        itemsCategory = this._addSubCategoryByType("Consumables", "consumable",itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubCategoryByType("Weapons", "weapon",itemsMacroType, itemList, tokenId, itemsCategory);

        this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
    
        return actionList;
    }

    _buildFeatsCategory(token, actionList){

        var itemList = token.actor.data.items.filter(item => item.type == "feat");
        let tokenId = token.data._id;

        var itemsCategoryName = "Features";
        var itemsMacroType = "feat";
        let itemsCategory = this.initializeEmptyCategory(itemsCategoryName);
        
        console.log(itemList.map(item => item.data.actionType));

        itemsCategory = this._addSubCategoryByActionType("Meele Weapon Attacks", "mwak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubCategoryByActionType("Ranged Weapon Attacks", "rwak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubCategoryByActionType("Melle Spell Attacks", "msak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubCategoryByActionType("Ranged Spell Attacks", "rsak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubCategoryByActionType("Healing", "heal", itemsMacroType, itemList, tokenId, itemsCategory);


        this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
    
        return actionList;


    }
  
    _buildSpellsCategory(token, actionList){

        var itemList = token.actor.data.items.filter(item => item.type == "spell");
        let tokenId = token.data._id;

        var categoryName = "Spellbook";
        var macroType = "spell";
        let category = this.initializeEmptyCategory(categoryName);

        var maxLevel = 6;
        
        for (let level = 0; level < maxLevel; level++) {
            category = this._addSubCategoryByLevel("Level " + level, level, macroType, itemList, tokenId, category);
            
        }

        this._combineCategoryWithList(actionList, categoryName, category);
    
        return actionList;
    }

    _addSubCategoryByActionType(subCategoryName, actionType, macroType, itemList, tokenId, category){
        
        
        let subCategory = this.initializeEmptySubcategory(subCategoryName);    

        let itemsOfType = itemList.filter(item => item.data.actionType == actionType);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    
    _addSubCategoryByType(subCategoryName, type, macroType, itemList, tokenId, category){
        
        let subCategory = this.initializeEmptySubcategory(subCategoryName);    

        let itemsOfType = itemList.filter(item => item.type == type);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    _addSubCategoryByLevel(subCategoryName, level, macroType, itemList, tokenId, category){
        
        let subCategory = this.initializeEmptySubcategory(subCategoryName);    

        let itemsOfType = itemList.filter(item => item.data.level == level);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    _buildItemAction(tokenId, macroType, item) {
        let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
        let result = { name: item.name, id: item._id, encodedValue: encodedValue }
        
        return result;
    }

}
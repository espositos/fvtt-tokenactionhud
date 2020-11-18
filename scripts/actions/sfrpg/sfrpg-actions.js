import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerSfrpg extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    async doBuildActionList(token, multipleTokens) {
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
        
        if (settings.get('showHudTitle'))
            actionList.hudTitle = token.data?.name;
        
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

        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.mwa'), "mwak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.rwa'), "rwak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.msa'), "msak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.rsa'), "rsak", itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByActionType(this.i18n('tokenactionhud.healing'), "heal", itemsMacroType, itemList, tokenId, itemsCategory);

        if (settings.get('showMiscFeats')) {
            const miscFeats = itemList.filter(i => !['mwak', 'rwak', 'msak', 'rsak', 'heal'].includes(i.data.actionType));
            itemsCategory = this._addSubcategoryByItemList(this.i18n('tokenactionhud.misc'), itemsMacroType, miscFeats, tokenId, itemsCategory);
        }

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
        
        const actorSkills = Object.entries(actor.data.data.skills);
        const coreSkills = CONFIG.SFRPG.skills;

        let skillsActions = actorSkills.map(s => {
            let key = s[0];
            let data = s[1];
            let name;
            if (key.startsWith('pro')) {
                name = coreSkills['pro'];
                if (!!data.subname)
                    name += ` (${data.subname})`;
            } else {
                name = coreSkills[key];
            }

            let encodedValue = [macroType, token.data._id, key].join(this.delimiter);
            let icon = this._getClassSkillIcon(data.value)
            return { name: name, id: key, encodedValue: encodedValue, icon: icon };
        }).sort((a,b) => {
            return a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'})
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

    _addSubcategoryByActionType(subCategoryName, actionType, macroType, itemList, tokenId, category) {  
        let subCategory = this.initializeEmptySubcategory();    

        let itemsOfType = itemList.filter(item => item.data.actionType == actionType);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    _addSubcategoryByItemList(subCategoryName, macroType, itemList, tokenId, category) {  
        let subCategory = this.initializeEmptySubcategory();

        subCategory.actions = itemList.map(item => this._buildItemAction(tokenId, macroType, item));
                  
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
        subCategory.actions = itemsOfType.map(item => {
            let action = this._buildItemAction(tokenId, macroType, item);
            if (settings.get('showSpellInfo'))
                this._addSpellInfo(item, action);
            return action;
        });
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    /** @private */
    _addSpellInfo(s, spell) {
        let data = s.data;

        if (data?.sr)
            spell.info2 += 'Sr';

        if (data?.dismissible)
            spell.info2 += 'D';

        if (data?.concentration)
            spell.info2 += 'C';

        if (data?.save?.type) {
            let type = data.save.type;
            spell.info3 += type?.charAt(0).toUpperCase() + type?.slice(1);
        }
    }

    _buildItemAction(tokenId, macroType, item) {
        let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
        let img = this._getImage(item);
        let icon = this._getActionIcon(item.data.activation?.type)
        let result = { name: item.name, id: item._id, encodedValue: encodedValue, img:img, icon: icon }        

        result.info1 = this._getQuantityData(item);

        result.info2 = this._getUsesOrUsageData(item);

        result.info3 = this._getCapacityData(item)
        
        return result;
    }

    /** @private */
    _getQuantityData(item) {
        let result = '';
        if (item.data.quantity > 1) {
            result = item.data.quantity;
        }

        return result;
    }

    /** @private */
    _getUsesOrUsageData(item) {
        let result = '';

        let uses = item.data.uses;
        if (uses?.max || uses?.value) {
            result = uses.value ?? '';
            
            if (uses.max > 0) {
                result += `/${uses.max}`
            }
            return result;
        }
        
        let usage = item.data.usage;
        if (usage?.value) {
            result = usage.value ?? '';
            
            if (usage.value > 0) {
                result += `/${usage.per}`
            }
            return result;
        }

        return result;
    }

    /** @private */
    _getCapacityData(item) {
        let result = '';

        let capacity = item.data.capacity;
        if (!capacity)
            return result;

        result = capacity.value ?? '';
        if (!!capacity.max)
            result += `/${capacity.max}`

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
    
    
    _getActionIcon(action) {
        const icon = {
            //action: `<i class="fas fa-fist-raised"></i>`,
            move: `<i class="fas fa-shoe-prints"></i>`,
            swift: `<i class="fas fa-bolt"></i>`,
            full: `<i class="fas fa-circle"></i>`,
            other: `<i class="far fa-circle"></i>`,
            reaction: `<i class="fas fa-undo-alt"></i>`,
            special: `<i class="fas fa-atom"></i>`,
            min: `<i class="fas fa-hourglass-start"></i>`,
            hour: `<i class="fas fa-hourglass-half"></i>`,
            day: `<i class="fas fa-hourglass-end"></i>`
        };
        return icon[action];
    }
}
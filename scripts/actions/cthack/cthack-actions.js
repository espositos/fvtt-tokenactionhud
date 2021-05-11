import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerCthack extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    async doBuildActionList(token, multipleTokens) {
        let result = this.initializeEmptyActionList();

        if (!token)
            return result;

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor)
            return result;

        let actorType = actor.data.type;
        if (actorType != "character")
            return result;

        result.actorId = actor._id;

        let saves = this._getSaves(actor, tokenId);
        let attributes = this._getAttributes(actor, tokenId);
        let items = this._getItemList(actor, tokenId);

        this._combineCategoryWithList(result, this.i18n('tokenactionhud.cthack.saves'), saves);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.cthack.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.cthack.items'), items);
        
        if (settings.get('showHudTitle'))
            result.hudTitle = token.data?.name;
            
        return result;
    }
    
    /** @private */
    _getSaves(actor, tokenId) {
        let result = this.initializeEmptyCategory('saves');
        let attributesCategory = this.initializeEmptySubcategory();

        let saves = Object.entries(actor.data.data.saves);
        
        attributesCategory.actions = saves.map(c => {
            const saveId = c[0];
            const name = game.cthack.config.saves[saveId];
            const macroType = 'save';
            let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
            return {name: name, encodedValue: encodedValue, id:c[0]}
        });
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.cthack.saves'), attributesCategory);
        return result;
    }

    /** @private */
    _getAttributes(actor, tokenId) {
        let result = this.initializeEmptyCategory('attributes');
        let attributesCategory = this.initializeEmptySubcategory();
        let attributes = actor.getAvailableAttributes();
        
        attributesCategory.actions = attributes.map(c => {            
            const attributeId = c[0];

            // The name depends of the settings
            let name;
            if (attributeId === "miscellaneous" && game.settings.get('cthack', 'MiscellaneousResource') !== "") {
                name = game.settings.get('cthack', 'MiscellaneousResource');
            }
            else name = game.cthack.config.attributes[attributeId];

            let macroType = 'resource';

            if (attributeId === "armedDamage" || attributeId === 'unarmedDamage') {
                macroType = 'damage';
            }
            let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
            return {name: name, encodedValue: encodedValue, id:c[0]}
        });  
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.cthack.attributes'), attributesCategory);
        return result;
    }

    /** @private */
    _getItemList(actor, tokenId) {
        let weapons = actor.items.filter(item => (item.data?.type === "weapon"));
        let weaponActions = weapons.map(w => this._buildEquipmentItem(tokenId, actor, 'weapon', w));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;
    
        let equipment = actor.items.filter(item => (item.data?.type === "item"));
        let equipmentActions = equipment.map(e => this._buildEquipmentItem(tokenId, actor, 'item', e));
        let equipmentCat = this.initializeEmptySubcategory();
        equipmentCat.actions = equipmentActions;

        let weaponsTitle = this.i18n('tokenactionhud.weapons');
        let equipmentTitle = this.i18n('tokenactionhud.equipment');
        
        let result = this.initializeEmptyCategory('inventory');

        this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
        this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);

        return result;
    }    

    /** @private */
    _produceMap(tokenId, itemSet, macroType) {
        return itemSet.filter(i => !!i).map(i => {
            let encodedValue = [macroType, tokenId, i.data._id].join(this.delimiter);
            let item = { name: i.name, encodedValue: encodedValue, id: i.data._id };
            return item;
        });
    }

    /** @private */
    _buildEquipmentItem(tokenId, actor, macroType, item) {
        let action = this._buildItem(tokenId, actor, macroType, item);
        
        return action;
    }
 
    /** @private */
    _buildItem(tokenId, actor, macroType, item) {
        let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
        let img = this._getImage(item);
        let result = { name: item.name, id: item._id, encodedValue: encodedValue, img: img }
        
        return result;
    }

    
    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }

}
import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerStarWarsFFG extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
        this.filterManager.createOrGetFilter('skills');
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

        result.actorId = actor._id;
        
        let weapons = this._getItemsList(actor, tokenId, 'weapon');
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.weapons'), weapons);

        const data = actor.data.data

        data.skilltypes.forEach((type) => {
            let skills = this._getSkills(type, actor, tokenId);
            this._combineCategoryWithList(result, type.label, skills);
        })
        
        
        if (settings.get('showHudTitle'))
            result.hudTitle = token.data?.name;
            
        return result;
    }

    _getItemsList(actor, tokenId, type) {
        let types = type+'s';
        let result = this.initializeEmptyCategory('items');

        let subcategory = this.initializeEmptySubcategory();
        
        let items = actor.items.filter(i => i.type === type);
        let filtered = actor.data.type === 'character' ? items.filter(i => i.data.data.equipped) : items;
        subcategory.actions = this._produceMap(tokenId, filtered, type);

        this._combineSubcategoryWithCategory(result, types, subcategory);

        return result;
    }

    _getSkills(type, actor, tokenId) {
        let categoryId = 'skills';
        let macroType = 'skill';
        
        let result = this.initializeEmptyCategory(categoryId);
        let data1 = actor.data
        let data = data1.data

        const skills = Object.keys(data.skills)
            .filter((s) => data.skills[s].type === type.type)
            .sort((a, b) => {
            let comparison = 0;
            if (a.toLowerCase() > b.toLowerCase()) {
                comparison = 1;
            } else if (a.toLowerCase() < b.toLowerCase()) {
                comparison = -1;
            }
            return comparison;
            });
        settings.Logger.debug(skills)
        let skillCat = this.initializeEmptySubcategory();
        skillCat.actions = this._produceMap(tokenId, skills, macroType);
        
        this._combineSubcategoryWithCategory(result, type.label, skillCat);

        return result;
    }

    _produceMap(tokenId, itemSet, type) {
        return itemSet.map(i => {
            let encodedValue = [type, tokenId, i].join(this.delimiter);
            return { name: i, encodedValue: encodedValue, id: i };
        });
    }
}
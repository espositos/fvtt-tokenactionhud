import {ActionHandler} from '../actionHandler.js';

export class ActionHandlerWfrp extends ActionHandler {
    constructor(rollHandlerWfrp) {
        super();
        this.rollHandler = rollHandlerWfrp;
    }    

    /** @override */
    buildActionList(token) {
        let result = { "tokenId": "", "actorId": "", "categories": {}};

        if (!token) {
            return result;
        }

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor) {
            return result;
        }

        result.actorId = actor._id;
        
        let weapons = this._getSubcategoryList(actor, tokenId, "weapon");
        let spells = this._getSubcategoryList(actor, tokenId, "spell");
        let prayers = this._getSubcategoryList(actor, tokenId, "prayer");
        let traits = this._getSubcategoryList(actor, tokenId, "trait");
        let skills = this._getSubcategoryList(actor, tokenId, "skill");
        let characteristics = this._getSubcategoryList(actor, tokenId, "characteristic");
        
        if (Object.entries(weapons.subcategories).length > 0)
            result.categories["weapons"] = weapons;
    
        if (Object.entries(spells.subcategories).length > 0)
            result.categories["spells"] = spells;
            
        if (Object.entries(prayers.subcategories).length > 0)
            result.categories["prayers"] = prayers;
        
        if (Object.entries(skills.subcategories).length > 0)
            result.categories["skills"] = skills;

        if (Object.entries(traits.subcategories).length > 0)
            result.categories["traits"] = traits;

        if (Object.entries(characteristics.subcategories).length > 0)
            result.categories["characteristics"] = characteristics;

        return result;
    }

    _getSubcategoryList(actor, tokenId, type) {
        let types = type+'s';
        let result = {
            "subcategories": {}
        }

        let subcategory = { 
            "actions": this._produceMap(tokenId ,actor.items.filter(i => i.type == type), type) };

        if (subcategory.actions.length > 0)
            result.subcategories[type+'s'] = subcategory;

        return result;
    }

    _produceMap(tokenId, itemSet, type) {
        return itemSet.map(i => { return { "name": i.name, "encodedValue": `${type}.${tokenId}.${i._id}`, "id": i._id };});
    }   
}
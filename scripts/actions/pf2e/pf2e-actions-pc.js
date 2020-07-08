import {ActionHandlerPf2e} from './pf2e-actions.js';
import * as settings from '../../settings.js';

export class PcActionHandlerPf2e {
    constructor(actionHandlerpf2e) {
        this.baseHandler = actionHandlerpf2e;
    }

    async buildActionList(result, tokenId, actor) {
        let strikes = this._getStrikesList(actor, tokenId);
        let actions = this.baseHandler._getActionsList(actor, tokenId);
        let items = this.baseHandler._getItemsList(actor, tokenId);
        let spells = this.baseHandler._getSpellsList(actor, tokenId);
        let feats = this.baseHandler._getFeatsList(actor, tokenId);
        let skills = this._getSkillsList(actor, tokenId);
        let saves = this.baseHandler._getSaveList(actor, tokenId);
        let attributes = this._getAttributeList(actor, tokenId);        
        
        this.baseHandler._combineCategoryWithList(result, 'strikes', strikes);
        this.baseHandler._combineCategoryWithList(result, 'actions', actions);
        this.baseHandler._combineCategoryWithList(result, 'items', items);
        this.baseHandler._combineCategoryWithList(result, 'spells', spells);
        this.baseHandler._combineCategoryWithList(result, 'feats', feats);
        this.baseHandler._combineCategoryWithList(result, 'skills', skills);
        this.baseHandler._combineCategoryWithList(result, 'saves', saves);
        if (settings.get('showPcAbilities')) {
            let abilities = this.baseHandler._getAbilityList(actor, tokenId);
            this.baseHandler._combineCategoryWithList(result, 'abilities', abilities);
        }
        this.baseHandler._combineCategoryWithList(result, 'attributes', attributes);
    }

    /** @private */
    _getStrikesList(actor, tokenId) {
        let macroType = 'strike';
        let result = this.baseHandler.initializeEmptyCategory();

        let strikes = actor.data.data.actions.filter(a => a.type === macroType);
        
        let calculateAttackPenalty = settings.get('calculateAttackPenalty')

        strikes.forEach(s => {
            let subcategory = this.baseHandler.initializeEmptySubcategory();
            let map = s.traits.some(t => t.name === 'agile') ? 4 : 5;
            let attackMod = s.totalModifier;
            
            let currentMap = 0;
            let currentBonus = attackMod;
            let calculatePenalty = calculateAttackPenalty;

            let variantsMap = s.variants.map(function (v) {
                let name;
                if (currentBonus === attackMod || calculatePenalty) {
                    name = currentBonus >= 0 ? `+${currentBonus}` : `${currentBonus}`;
                }
                else {
                    name = currentMap >= 0 ? `+${currentMap}` : `${currentMap}`;
                }
                currentMap -= map;
                currentBonus -= map;
                return {_id: encodeURIComponent(`${this.name}>${this.variants.indexOf(v)}`), name: name }
            }.bind(s));

            subcategory.actions = this.baseHandler._produceMap(tokenId, variantsMap, macroType);
            
            let damageEncodedValue = [macroType, tokenId, encodeURIComponent(s._id+'>damage')].join(this.baseHandler.delimiter);
            let critEncodedValue = [macroType, tokenId, encodeURIComponent(s._id+'>critical')].join(this.baseHandler.delimiter);
            subcategory.actions.push({name: 'Damage', encodedValue: damageEncodedValue, id: encodeURIComponent(s.name+'>damage')})
            subcategory.actions.push({name: 'Critical', encodedValue: critEncodedValue, id: encodeURIComponent(s.name+'>critical')})

            this.baseHandler._combineSubcategoryWithCategory(result, s.name, subcategory);
        });

        return result;
    }

    /** @private */
    _getSkillsList(actor, tokenId) {
        let result = this.baseHandler.initializeEmptyCategory();
        
        let abbr = settings.get('abbreviateSkills');

        let actorSkills = actor.data.data.skills;
        let skillMap = Object.keys(actorSkills).map(k => { 
            let name = abbr ? k.charAt(0).toUpperCase()+k.slice(1) : CONFIG.PF2E.skills[k];
            return {'_id': k, 'name': name}
        });

        let skills = this.baseHandler.initializeEmptySubcategory();
        skills.actions = this.baseHandler._produceMap(tokenId, skillMap, 'skill');

        let loreItems = actor.items.filter(i => i.data.type === 'lore');
        let lore = this.baseHandler.initializeEmptySubcategory();
        lore.actions = this.baseHandler._produceMap(tokenId, loreItems, 'lore');

        this.baseHandler._combineSubcategoryWithCategory(result, 'skills', skills);
        this.baseHandler._combineSubcategoryWithCategory(result, 'lore', lore);

        return result;
    }

    /** @private */
    _getAttributeList(actor, tokenId) {
        let macroType = 'attribute';
        let result = this.baseHandler.initializeEmptyCategory();
        let attributes = this.baseHandler.initializeEmptySubcategory();

        let rollableAttributes = Object.entries(actor.data.data.attributes).filter(a => { if(a[1]) return !!a[1].roll });
        let attributesMap = rollableAttributes.map(a => {
            let name = a[0].charAt(0).toUpperCase()+a[0].slice(1);
            return { _id: a[0], name: name } 
        });
        
        attributes.actions = this.baseHandler._produceMap(tokenId, attributesMap, macroType);
        
        this.baseHandler._combineSubcategoryWithCategory(result, 'attributes', attributes);

        return result;
    }


}
import {ActionHandlerPf2e} from './pf2e-actions.js';
import * as settings from '../../settings.js';

export class NpcActionHandlerPf2e {
    constructor(actionHandlerpf2e) {
        this.baseHandler = actionHandlerpf2e;
    }

    async buildActionList(result, tokenId, actor) {
        let strikes = this._getStrikesListNpc(actor, tokenId);
        let actions = this.baseHandler._getActionsList(actor, tokenId);
        let items = this.baseHandler._getItemsList(actor, tokenId);
        let spells = this.baseHandler._getSpellsList(actor, tokenId);
        let feats = this.baseHandler._getFeatsList(actor, tokenId);
        let skills = this._getSkillsListNpc(actor, tokenId);
        let saves = this.baseHandler._getSaveList(actor, tokenId);
        let attributes = this._getAttributeListNpc(actor, tokenId);     
        
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.strikes'), strikes);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.actions'), actions);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), items);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.spells'), spells);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.features'), feats);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.skills'), skills);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.saves'), saves);
        if (settings.get('showNpcAbilities')) {
            let abilities = this.baseHandler._getAbilityList(actor, tokenId);
            this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.abilities'), abilities);
        }
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
    }

    /** @private */
    _getStrikesListNpc(actor, tokenId) {
        let macroType = 'strike';
        let result = this.baseHandler.initializeEmptyCategory('strikes');

        let strikes = actor.items.filter(a => a.type === 'melee');

        let calculateAttackPenalty = settings.get('calculateAttackPenalty')

        strikes.forEach(s => {
            let subcategory = this.baseHandler.initializeEmptySubcategory();

            let variantsMap = [];
            let map = (s.data.data.traits.value || []).includes('agile') || s.data.isAgile ? 4 : 5;
            let attackMod = s.data.data.bonus.total;

            if (!attackMod)
                attackMod = s.data.data.bonus.value ?? 0;
            
            let currentMap = 0;
            let currentBonus = attackMod;

            for (let i = 0; i < 3; i++) {
                if (currentBonus === attackMod || calculateAttackPenalty) {
                    name = currentBonus >= 0 ? `+${currentBonus}` : `${currentBonus}`;
                }
                else {
                    name = currentMap >= 0 ? `+${currentMap}` : `${currentMap}`;
                }
                currentMap -= map;
                currentBonus -= map;

                variantsMap.push({_id: `${s.data._id}>${i}`, name: name});
            }
                
            subcategory.actions = this.baseHandler._produceMap(tokenId, variantsMap, macroType);
            
            let damageEncodedValue = [macroType, tokenId, encodeURIComponent(s.data._id+'>damage')].join(this.baseHandler.delimiter);
            let critEncodedValue = [macroType, tokenId, encodeURIComponent(s.data._id+'>critical')].join(this.baseHandler.delimiter);
            subcategory.actions.push({name: this.i18n('tokenactionhud.damage'), encodedValue: damageEncodedValue, id: encodeURIComponent(s.data._id+'>damage')})
            subcategory.actions.push({name: this.i18n('tokenactionhud.critical'), encodedValue: critEncodedValue, id: encodeURIComponent(s.data._id+'>critical')})

            let attackEffects = s.data.data.attackEffects?.value;
            if (attackEffects.length > 0) {}
                attackEffects.forEach(a => {
                    let id = `plus>${encodeURIComponent(a)}`;
                    let encodedValue = [macroType, tokenId, id].join(this.baseHandler.delimiter);
                    subcategory.actions.push({name: `Plus ${a}`, encodedValue: encodedValue, id: id})
                });

            this.baseHandler._combineSubcategoryWithCategory(result, s.name, subcategory);
        });

        return result;
    }

    /** @private */
    _getSkillsListNpc(actor, tokenId) {
        let result = this.baseHandler.initializeEmptyCategory('skills');
        
        let loreItems = actor.items.filter(i => i.data.type === 'lore');
        let lore = this.baseHandler.initializeEmptySubcategory();
        lore.actions = this.baseHandler._produceMap(tokenId, loreItems, 'lore');
        
        let abbr = settings.get('abbreviateSkills');
        if (abbr)
            lore.actions.forEach(l => { 
                l.name = l.name.substr(0,3)
            });

        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.skills'), lore);

        return result;
    }

    /** @private */
    _getAttributeListNpc(actor, tokenId) {
        let macroType = 'attribute';
        let result = this.baseHandler.initializeEmptyCategory('attributes');
        let attributes = this.baseHandler.initializeEmptySubcategory();

        let attributesMap = [{_id: 'perception', name: 'Perception'},{_id: 'initiative', name: 'Initiative'}]
        
        attributes.actions = this.baseHandler._produceMap(tokenId, attributesMap, macroType);
        
        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);

        return result;
    }
}
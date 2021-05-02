import * as settings from '../../settings.js';

export class NpcActionHandlerPf2e {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    
    constructor(actionHandlerpf2e) {
        this.baseHandler = actionHandlerpf2e;
    }

    buildActionList(result, tokenId, actor) {
        let strikes = this._getStrikesListNpc(actor, tokenId);
        let actions = this.baseHandler._getActionsList(actor, tokenId);
        let items = this.baseHandler._getItemsList(actor, tokenId);
        let spells = this.baseHandler._getSpellsList(actor, tokenId);
        let feats = this.baseHandler._getFeatsList(actor, tokenId);
        let skills = this._getSkillsList(actor, tokenId);
        let saves = this.baseHandler._getSaveList(actor, tokenId);
        let attributes = this._getAttributeListNpc(actor, tokenId); 
        let effects = this.baseHandler._getEffectsList(actor, tokenId);
        let utilities = this.baseHandler._getUtilityList(actor, tokenId); 
        
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.strikes'), strikes);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.actions'), actions);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.effects'), effects);
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
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.utility'), utilities)
    }

    /** @private */
    _getStrikesListNpc(actor, tokenId) {
        let result = this.baseHandler.initializeEmptyCategory('strikes');
        result.cssClass = 'oneLine';
        
        if (settings.get('showOldNpcStrikes')) {
            this._addNpcStrikesCategories(actor, tokenId, result);
        }

        const info = this.baseHandler.i18n('tokenactionhud.experimental');

        this.baseHandler._addStrikesCategories(actor, tokenId, result, info);
        
        return result;
    }

    /** @private */
    _addNpcStrikesCategories(actor, tokenId, category) {
        let strikes = actor.items.filter(a => a.type === 'melee').sort(this._foundrySort);
        
        let calculateAttackPenalty = settings.get('calculateAttackPenalty')
        
        const macroType = 'npcStrike';
        strikes.forEach(s => {
            let subcategory = this.baseHandler.initializeEmptySubcategory();
            let actionIcon = parseInt((s.data.data.actions || {}).value, 10) || 1;
            subcategory.icon = this.baseHandler._getActionIcon(actionIcon)
            
            let variantsMap = [];
            let map = (s.data.data.traits.value || []).includes('agile') || s.data.isAgile ? 4 : 5;
            let attackMod = s.data.data.bonus.value;
            
            if (!attackMod)
                attackMod = s.data.data.bonus.total ?? 0;
            
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
            
            variantsMap[0].img = s.data.img;
            subcategory.actions = this.baseHandler._produceActionMap(tokenId, variantsMap, macroType);
            
            let damageEncodedValue = [macroType, tokenId, encodeURIComponent(s.data._id+'>damage')].join(this.baseHandler.delimiter);
            let critEncodedValue = [macroType, tokenId, encodeURIComponent(s.data._id+'>critical')].join(this.baseHandler.delimiter);
            subcategory.actions.push({name: this.i18n('tokenactionhud.damage'), encodedValue: damageEncodedValue, id: encodeURIComponent(s.data._id+'>damage')})
            subcategory.actions.push({name: this.i18n('tokenactionhud.critical'), encodedValue: critEncodedValue, id: encodeURIComponent(s.data._id+'>critical')})

            let attackEffects = s.data.data.attackEffects?.value;
            if (attackEffects.length > 0) {
                attackEffects.forEach(a => {
                    let id = `plus>${encodeURIComponent(a)}`;
                    let encodedValue = [macroType, tokenId, id].join(this.baseHandler.delimiter);
                    subcategory.actions.push({name: `Plus ${a}`, encodedValue: encodedValue, id: id})
                });
            }
            
            this.baseHandler._combineSubcategoryWithCategory(category, s.name, subcategory);
        });
    }

    /** @private */
    _getSkillsList(actor, tokenId) {
        let result = this.baseHandler.initializeEmptyCategory('skills');
        
        let abbreviated = settings.get('abbreviateSkills');

        let actorSkills = Object.entries(actor.data.data.skills).filter(s => !!s[1].name && s[1].name.length > 1);
        
        let skillMap = actorSkills.filter(s => !s[1].lore)
            .map(s => this.baseHandler.createSkillMap(tokenId, 'skill', s, abbreviated));
        let skills = this.baseHandler.initializeEmptySubcategory();
        skills.actions = skillMap;

        let loreMap = actorSkills.filter(s => s[1].lore)
            .sort(this._foundrySort)
            .map(s => this.baseHandler.createSkillMap(tokenId, 'skill', s, abbreviated));
        let lore = this.baseHandler.initializeEmptySubcategory();
        lore.actions = loreMap;

        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.skills'), skills);
        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.lore'), lore);

        return result;
    }

    /** @private */
    _getAttributeListNpc(actor, tokenId) {
        let macroType = 'attribute';
        let result = this.baseHandler.initializeEmptyCategory('attributes');
        let attributes = this.baseHandler.initializeEmptySubcategory();

        let attributesMap = [{_id: 'perception', name: 'Perception'},{_id: 'initiative', name: 'Initiative'}]
        
        attributes.actions = this.baseHandler._produceActionMap(tokenId, attributesMap, macroType);
        
        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);

        return result;
    }
    
    /** @protected */
    _foundrySort(a, b) {
        if (!(a?.data?.sort || b?.data?.sort))
            return 0;

        return a.data.sort - b.data.sort;
    }
}
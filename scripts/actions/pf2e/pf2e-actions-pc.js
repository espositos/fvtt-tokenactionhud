import * as settings from '../../settings.js';

export class PcActionHandlerPf2e {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);

    constructor(actionHandlerpf2e) {
        this.baseHandler = actionHandlerpf2e;
    }

    buildActionList(result, tokenId, actor) {
        let strikes = this._getStrikesList(actor, tokenId);
        let actions = this.baseHandler._getActionsList(actor, tokenId);
        let items = this.baseHandler._getItemsList(actor, tokenId);
        let spells = this.baseHandler._getSpellsList(actor, tokenId);
        let feats = this.baseHandler._getFeatsList(actor, tokenId);
        let skills = this._getSkillsList(actor, tokenId);
        let saves = this.baseHandler._getSaveList(actor, tokenId);
        let attributes = this._getAttributeList(actor, tokenId);
        let utilities = this.baseHandler._getUtilityList(actor, tokenId);
        
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.strikes'), strikes);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.actions'), actions);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), items);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.spells'), spells);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.features'), feats);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.skills'), skills);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.saves'), saves);

        if (settings.get('showPcAbilities')) {
            let abilities = this.baseHandler._getAbilityList(actor, tokenId);
            this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.abilities'), abilities);
        }

        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.utility'), utilities)
    }

    /** @private */
    _getStrikesList(actor, tokenId) {
        let macroType = 'strike';
        let result = this.baseHandler.initializeEmptyCategory('strikes');
        result.cssClass = 'oneLine';

        let strikes = actor.data.data.actions.filter(a => a.type === macroType);
        
        let calculateAttackPenalty = settings.get('calculateAttackPenalty');

        strikes.forEach(s => {
            let subcategory = this.baseHandler.initializeEmptySubcategory();
            subcategory.img = this._getImage(s)
            let glyph = s.glyph;
            if (glyph)
                subcategory.icon = `<span style='font-family: "Pathfinder2eActions"'>${glyph}</span>`

            let map = Math.abs(parseInt(s.variants[1].label.split(' ')[1]));
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
            
            let damageEncodedValue = [macroType, tokenId, encodeURIComponent(s.name+'>damage')].join(this.baseHandler.delimiter);
            let critEncodedValue = [macroType, tokenId, encodeURIComponent(s.name+'>critical')].join(this.baseHandler.delimiter);
            subcategory.actions.push({name: this.i18n('tokenactionhud.damage'), encodedValue: damageEncodedValue, id: encodeURIComponent(s.name+'>damage')})
            subcategory.actions.push({name: this.i18n('tokenactionhud.critical'), encodedValue: critEncodedValue, id: encodeURIComponent(s.name+'>critical')})

            this.baseHandler._combineSubcategoryWithCategory(result, s.name, subcategory);
        });

        return result;
    }

    /** @private */
    _getSkillsList(actor, tokenId) {
        let result = this.baseHandler.initializeEmptyCategory('skills');
        
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

        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.skills'), skills);
        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.lore'), lore);

        return result;
    }

    /** @private */
    _getAttributeList(actor, tokenId) {
        let macroType = 'attribute';
        let result = this.baseHandler.initializeEmptyCategory('attributes');
        let attributes = this.baseHandler.initializeEmptySubcategory();

        let rollableAttributes = Object.entries(actor.data.data.attributes).filter(a => { if(a[1]) return !!a[1].roll });
        let attributesMap = rollableAttributes.map(a => {
            let name = a[0].charAt(0).toUpperCase()+a[0].slice(1);
            return { _id: a[0], name: name } 
        });
        
        attributes.actions = this.baseHandler._produceMap(tokenId, attributesMap, macroType);
        
        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);

        return result;
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.imageUrl ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }
}
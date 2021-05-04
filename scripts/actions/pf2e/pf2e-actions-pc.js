import * as settings from '../../settings.js';

export class PcActionHandlerPf2e {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);

    constructor(actionHandlerpf2e) {
        this.baseHandler = actionHandlerpf2e;
    }

    buildActionList(result, tokenId, actor) {
        const type = actor.data.type;
        if (type === 'familiar') {
            this._forFamiliar(result, tokenId, actor);
        } else {
            this._forCharacter(result, tokenId, actor);
        }

        let skills = this._getSkillsList(actor, tokenId);
        let saves = this.baseHandler._getSaveList(actor, tokenId);
        let attributes = this._getAttributeList(actor, tokenId);
        let utilities = this.baseHandler._getUtilityList(actor, tokenId);

        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.skills'), skills);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.saves'), saves);

        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.utility'), utilities)
    }

    /** @private */
    _forFamiliar(result, tokenId, actor) {
        let attack = this._getFamiliarAttack(actor, tokenId);
        let items = this.baseHandler._getItemsList(actor, tokenId);
        let effects = this.baseHandler._getEffectsList(actor, tokenId);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), items);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.attack'), attack);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.effects'), effects);
    }

    /** @private */
    _forCharacter(result, tokenId, actor) {
        let toggles = this._getTogglesCategory(actor, tokenId);
        let strikes = this._getStrikesList(actor, tokenId);
        let actions = this.baseHandler._getActionsList(actor, tokenId);
        let items = this.baseHandler._getItemsList(actor, tokenId);
        let spells = this.baseHandler._getSpellsList(actor, tokenId);
        let effects = this.baseHandler._getEffectsList(actor, tokenId);
        let feats = this.baseHandler._getFeatsList(actor, tokenId);
                
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.toggles'), toggles);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.strikes'), strikes);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.actions'), actions);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.effects'), effects);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), items);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.spells'), spells);
        this.baseHandler._combineCategoryWithList(result, this.i18n('tokenactionhud.features'), feats);
    }

    /** @private */
    _getTogglesCategory(actor, tokenId) {
        if (!settings.get('separateTogglesCategory'))
            return;

        let result = this.baseHandler.initializeEmptyCategory('toggles');
        this._addTogglesCategories(actor, tokenId, result);

        return result;
    }

    /** @private */
    _getStrikesList(actor, tokenId) {
        let result = this.baseHandler.initializeEmptyCategory('strikes');
        result.cssClass = 'oneLine';
        
        if (!settings.get('separateTogglesCategory'))
            this._addTogglesCategories(actor, tokenId, result);
            
        this.baseHandler._addStrikesCategories(actor, tokenId, result);

        return result;
    }

    /** @private */
    _addTogglesCategories(actor, tokenId, category) {
        const macroType = 'toggle';
        const toggleActions = actor.data.data.toggles?.actions;

        if (!toggleActions)
            return;

        let subcategory = this.baseHandler.initializeEmptySubcategory();
        subcategory.actionsClass = 'excludeFromWidthCalculation';

        toggleActions.forEach(t => {
            let toggleKey = this._getToggleKey(t.inputName);
            if (!toggleKey)
                return;

            let id = toggleKey;
            let encodedValue = [macroType, tokenId, toggleKey].join(this.baseHandler.delimiter);
            let name = t.label.startsWith('PF2E.') ? this.baseHandler.i18n(t.label) : t.label;
            let cssClass = t.checked ? 'active': '';

            let action = {id: id, encodedValue: encodedValue, name: name, cssClass: cssClass};

            subcategory.actions.push(action);
        });
        
        this.baseHandler._combineSubcategoryWithCategory(category, this.baseHandler.i18n('tokenactionhud.toggles'), subcategory);
    }

    /** @private */
    _getToggleKey(inputName) {
        const rollOptionPrefix = 'flags.pf2e.rollOptions.';
        if (!inputName.includes(rollOptionPrefix))
            return '';

        return inputName.substring(rollOptionPrefix.length);
    }

    /** @private */
    _getFamiliarAttack(actor, tokenId) {
        let macroType = 'familiarAttack';
        let result = this.baseHandler.initializeEmptyCategory('attack');

        let subcategory = this.baseHandler.initializeEmptySubcategory();
                
        const att = actor.data.data.attack;
        const attMod = att.totalModifier < 0 ? att.totalModifier : `+${att.totalModifier}`;

        let name = att.name.charAt(0).toUpperCase() + att.name.slice(1);

        let encodedValue = [macroType, tokenId, att.name].join(this.baseHandler.delimiter);

        let action = {name: name, encodedValue: encodedValue, encodedValue, info1: attMod}
            
        subcategory.actions = [action];
            
        this.baseHandler._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attack'), subcategory);

        return result;
    }

    /** @private */
    _getSkillsList(actor, tokenId) {
        let result = this.baseHandler.initializeEmptyCategory('skills');
        
        let abbreviated = settings.get('abbreviateSkills');

        let actorSkills = Object.entries(actor.data.data.skills);
        
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
    _getAttributeList(actor, tokenId) {
        let macroType = 'attribute';
        let result = this.baseHandler.initializeEmptyCategory('attributes');
        let attributes = this.baseHandler.initializeEmptySubcategory();

        let rollableAttributes = Object.entries(actor.data.data.attributes).filter(a => !!a[1]?.roll );
        let attributesMap = rollableAttributes.map(a => {
            let key = a[0];
            let data = a[1];
            let name = data.label ? data.label : key.charAt(0).toUpperCase()+key.slice(1);
            return { _id: a[0], name: name } 
        });
        
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

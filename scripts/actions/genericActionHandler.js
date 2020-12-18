export class GenericActionHandler {
    baseHandler;

    constructor(baseHandler) {
        this.baseHandler = baseHandler;
    }

    addGenericCategories(token, actionList, isMultipleTokens) {
        this._addConditions(token, actionList, isMultipleTokens);
        this._addUtilities(token, actionList, isMultipleTokens);
    }

    /** @private */
    _addConditions(token, actionList, isMultipleTokens) {
        
    }

    /** @private */
    _addUtilities(token, actionList, isMultipleTokens) {
        let utilityCat = actionList.categories.find(c => c.id === 'utility');
        if (!utilityCat) {
            utilityCat = this.baseHandler.initializeEmptyCategory('utility');
            utilityCat.name = this.baseHandler.i18n('tokenactionhud.utility')
            actionList.categories.push(utilityCat);
        }

        if (isMultipleTokens) {
            const tokens = canvas.tokens.controlled;
            this._addMultiUtilities(utilityCat, tokens)
        }
        else {
            this._getUtilityList(utilityCat, token.id);
        }
    }

    /** @private */
    _getUtilityList(utilityCat, tokenId) {
        let macroType = 'utility';

        let utility = this.baseHandler.initializeEmptySubcategory();
            
        let combatStateValue = [macroType, tokenId, 'toggleCombat'].join(this.baseHandler.delimiter);
        let combatAction = {id:'toggleCombat', encodedValue: combatStateValue, name: this.baseHandler.i18n('tokenactionhud.toggleCombatState')};
        combatAction.cssClass = canvas.tokens.placeables.find(t => t.data._id === tokenId).inCombat ? 'active' : '';
        utility.actions.push(combatAction);
        
        if (game.user.isGM) {
            let visbilityValue = [macroType, tokenId, 'toggleVisibility'].join(this.baseHandler.delimiter);
            let visibilityAction = {id:'toggleVisibility', encodedValue: visbilityValue, name: this.baseHandler.i18n('tokenactionhud.toggleVisibility')};
            visibilityAction.cssClass = !canvas.tokens.placeables.find(t => t.data._id === tokenId).data.hidden ? 'active' : '';
            utility.actions.push(visibilityAction);
        }

        this.baseHandler._combineSubcategoryWithCategory(utilityCat, this.baseHandler.i18n('tokenactionhud.token'), utility);
    }

    /** @private */
    _addMultiUtilities(utilityCat, tokens) {
        let macroType = 'utility';
        let tokenId = 'multi';

        let utility = this.baseHandler.initializeEmptySubcategory();
            
        let combatStateValue = [macroType, tokenId, 'toggleCombat'].join(this.baseHandler.delimiter);
        let combatAction = {id:'toggleCombat', encodedValue: combatStateValue, name: this.baseHandler.i18n('tokenactionhud.toggleCombatState')};
        combatAction.cssClass = tokens.every(t => t.inCombat) ? 'active' : '';
        utility.actions.push(combatAction);
        
        if (game.user.isGM) {
            let visbilityValue = [macroType, tokenId, 'toggleVisibility'].join(this.baseHandler.delimiter);
            let visibilityAction = {id:'toggleVisibility', encodedValue: visbilityValue, name: this.baseHandler.i18n('tokenactionhud.toggleVisibility')};
            visibilityAction.cssClass = tokens.every(t => !t.data.hidden) ? 'active' : '';
            utility.actions.push(visibilityAction);
        }

        this.baseHandler._combineSubcategoryWithCategory(utilityCat, this.baseHandler.i18n('tokenactionhud.token'), utility);
    }
}
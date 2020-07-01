import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerDw extends ActionHandler {
    constructor () {
        super();
    }

    /** @override */
    buildActionList(token) {
        let result = this.initializeEmptyActionList();

        if (!token)
            return result;

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor)
        return result;

        result.actorId = actor._id;
        let actorType = actor.data.type;
        if (actorType === 'npc') {
            let damage = this._getDamage(actor, tokenId);
            let tags = this._getTags(actor, tokenId);
            let specialQualities = this._getSpecialQualities(actor, tokenId);
        } else if (actorType === 'character') {
            let basicMoves = this._getStartingMoves(actor, tokenId);
            let advancedMoves = this._getAdvancedMoves(actor, tokenId);
            let otherMoves = this._getStartingMoves(actor, tokenId);
            let spells = this._getSpells(actor, tokenId);
            let equipment = this._getEquipment(actor, tokenId);
            let abilities = this._getAbilities(actor, tokenId);
            
            this._combineCategoryWithList(result, 'basic moves', actions);
            this._combineCategoryWithList(result, 'advanced moves', actions);
            this._combineCategoryWithList(result, 'other moves', actions);
            this._combineCategoryWithList(result, 'spells', actions);
            this._combineCategoryWithList(result, 'equipment', actions);
            this._combineCategoryWithList(result, 'abilities', actions);
        }        

        return result;
    }

    /** @private */
    _getStartingMoves(actor, tokenId) {
        let result = this.initializeEmptyCategory();
        let moves = actor.itemTypes.move.filter(m => m.data.data.moveType === 'starting');

        let rollMoves = moves.filter(m => m.data.data.rollType !== '');
        let rollActions = this._produceMap(tokenId, actorType, rollMoves, 'move');
        let rollCategory = this.initializeEmptySubcategory();
        rollCategory.actions = rollActions;

        let bookMoves = moves.filter(m => m.data.data.rollType === '');
        let bookActions = this._produceMap(tokenId, actorType, bookMoves, 'move');
        let bookCategory = this.initializeEmptySubcategory();
        bookCategory.actions = bookActions;

        this._combineSubcategoryWithCategory(result, 'roll', rollCategory);
        this._combineSubcategoryWithCategory(result, 'roll', bookCategory);
    }

    /** @private */
    _getAdvancedMoves(actor, tokenId) {
        let moves = actor.itemTypes.move.filter(m => m.data.data.moveType === 'advanced');
    }

    /** @private */
    _getStartingMoves(actor, tokenId) {
        let moves = actor.itemTypes.move.filter(m => m.data.data.moveType === 'basic');
    }

    /** @private */
    _getSpells(actor, tokenId) {

    }

    /** @private */
    _getEquipment(actor, tokenId) {

    }

    /** @private */
    _getAbilities(actor, tokenId) {

    }

    /** @private */
    _produceMap(tokenId, actorType, itemSet, macroType) {
        return itemSet.map(i => { return { 'name': i.name, 'encodedValue': `${actorType}.${macroType}.${tokenId}.${i.data._id}`, 'id': i.data._id };});
    }
}
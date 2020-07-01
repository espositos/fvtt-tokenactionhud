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
            let damage = this._getDamage(actor, tokenId, actorType);
            let tags = this._getTags(actor, tokenId, actorType);
            let specialQualities = this._getSpecialQualities(actor, tokenId, actorType);

            this._combineCategoryWithList(result, 'damage', damage);
            this._combineCategoryWithList(result, 'tags', tags);
            this._combineCategoryWithList(result, 'special qualities', specialQualities);
        } else if (actorType === 'character') {
            let startingMoves = this._getMovesByType(actor, tokenId, actorType, 'starting');
            let advancedMoves = this._getMovesByType(actor, tokenId, actorType, 'advanced');
            let basicMoves = this._getMovesByType(actor, tokenId, actorType, 'basic');
            let spells = this._getSubcategoryByType(actor, tokenId, actorType, 'spells', 'spell');
            let equipment = this._getSubcategoryByType(actor, tokenId, actorType, 'equipment', 'equipment');
            let abilities = this._getAbilities(actor, tokenId, actorType);
            
            this._combineCategoryWithList(result, 'basic moves', startingMoves);
            this._combineCategoryWithList(result, 'advanced moves', advancedMoves);
            this._combineCategoryWithList(result, 'other moves', basicMoves);
            this._combineCategoryWithList(result, 'spells', spells);
            this._combineCategoryWithList(result, 'equipment', equipment);
            this._combineCategoryWithList(result, 'abilities', abilities);
        }        

        return result;
    }

    _getMovesByType(actor, tokenId, actorType, movesType) {
        let moves = actor.itemTypes.move.filter(m => m.data.data.moveType === movesType);
        let result = this.initializeEmptyCategory();

        let rollCategory = this._getRollMoves(moves, tokenId, actorType);
        let bookCategory = this._getBookMoves(moves, tokenId, actorType);

        this._combineSubcategoryWithCategory(result, 'roll', rollCategory);
        this._combineSubcategoryWithCategory(result, 'book', bookCategory);

        return result;
    }

    _getRollMoves(moves, tokenId, actorType) {
        let rollMoves = moves.filter(m => m.data.data.rollType !== '');
        let rollActions = this._produceMap(tokenId, actorType, rollMoves, 'move');
        let rollCategory = this.initializeEmptySubcategory();
        rollCategory.actions = rollActions;

        return rollCategory;
    }

    _getBookMoves(moves, tokenId, actorType) {
        let bookMoves = moves.filter(m => m.data.data.rollType === '');
        let bookActions = this._produceMap(tokenId, actorType, bookMoves, 'move');
        let bookCategory = this.initializeEmptySubcategory();
        bookCategory.actions = bookActions;

        return bookCategory;
    }

    /** @private */
    _getSubcategoryByType(actor, tokenId, actorType, categoryName, categoryType) {
        let items = actor.itemTypes[categoryType];
        let result = this.initializeEmptyCategory();
        let actions = this._produceMap(tokenId, actorType, items, categoryType);
        let category = this.initializeEmptySubcategory();
        category.actions = actions;

        this._combineSubcategoryWithCategory(result, categoryName, category);

        return result;
    }

    /** @private */
    _getAbilities(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let abilities = Object.entries(actor.data.data.abilities);
        let abilitiesMap = abilities.map(a => { return { data: { _id:a[0] }, name:a[1].label } })
        let actions = this._produceMap(tokenId, actorType, abilitiesMap, 'ability');
        let abilitiesCategory = this.initializeEmptySubcategory();
        abilitiesCategory.actions = actions;

        this._combineSubcategoryWithCategory(result, 'abilities', abilitiesCategory);

        return result;
    }

    /** @private */
    _produceMap(tokenId, actorType, itemSet, macroType) {
        return itemSet.map(i => { return { 'name': i.name, 'encodedValue': `${actorType}.${macroType}.${tokenId}.${i.data._id}`, 'id': i.data._id };});
    }
}
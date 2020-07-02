import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerDw extends ActionHandler {
    constructor () {
        super();
        const gmmoves = this._getCompendiumEntries('GM Moves', 'gm-movesprincipals');
        const charts = this._getCompendiumEntries('charts', 'charts');
        const treasure = this._getCompendiumEntries('treasure', 'treasure');
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
            this.moves = this._getMovesNpc(actor, tokenId, actorType);

            this._combineCategoryWithList(result, 'damage', damage);
            this._combineCategoryWithList(result, 'tags', tags);
            this._combineCategoryWithList(result, 'special qualities', specialQualities);

            if (game.user.isGM) {
                this._combineCategoryWithList(result, 'GM moves', this.gmmoves);
                this._combineCategoryWithList(result, 'charts', this.charts);
                this._combineCategoryWithList(result, 'treasure', this.treasure);
            }
        } else if (actorType === 'character') {
            let damage = this._getDamage(actor, tokenId, actorType);
            let startingMoves = this._getMovesByType(actor, tokenId, actorType, 'starting');
            let advancedMoves = this._getMovesByType(actor, tokenId, actorType, 'advanced');
            let basicMoves = this._getMovesByType(actor, tokenId, actorType, 'basic');
            let spells = this._getSubcategoryByType(actor, tokenId, actorType, 'spells', 'spell');
            let equipment = this._getSubcategoryByType(actor, tokenId, actorType, 'equipment', 'equipment');
            let abilities = this._getAbilities(actor, tokenId, actorType);
            
            this._combineCategoryWithList(result, 'damage', damage);
            this._combineCategoryWithList(result, 'basic moves', startingMoves);
            this._combineCategoryWithList(result, 'advanced moves', advancedMoves);
            this._combineCategoryWithList(result, 'other moves', basicMoves);
            this._combineCategoryWithList(result, 'spells', spells);
            this._combineCategoryWithList(result, 'equipment', equipment);
            this._combineCategoryWithList(result, 'abilities', abilities);
        }        

        return result;
    }

    _getDamage(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();
        let damageCategory = this.initializeEmptySubcategory();
        damageCategory.actions.push({name: 'Damage', encodedValue: `${actorType}.damage.${tokenId}.damage`, 'id': 'damage' })

        this._combineSubcategoryWithCategory(result, 'damage', damageCategory);

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

    _getMovesNpc(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let biography = actor.data.data.details.biography;
        
        
        let instinctsCategory = this.initializeEmptySubcategory();
        let instinctRegex = new RegExp('<p(|\s+[^>]*)>(Instinct:.*?)<\/p\s*>', 'g')
        let instinctMap = Array.from(biography.matchAll(instinctRegex)).map(m => {
            move = m[2];
            let encodedValue = encodeURIComponent(move);
        return {data: {_id: encodedValue}, name: move};
        });

        let instinctActions = this._produceMap(tokenId, actorType, instinctMap, 'instinct');
        instinctsCategory.actions = instinctActions;

        let movesCategory = this.initializeEmptySubcategory();
        var movesRegex = new RegExp('<li(|\s+[^>]*)>(.*?)<\/li\s*>', 'g');
        var movesMap = Array.from(biography.matchAll(movesRegex)).map(m => {
            move = m[2];
            let encodedValue = encodeURIComponent(move);
        return {data: {_id: encodedValue}, name: move};
        });

        let movesActions = this._produceMap(tokenId, actorType, movesMap, 'move')
        movesCategory.actions = movesActions;
        
        this._combineSubcategoryWithCategory(result, 'Instinct', instinctsCategory);
        this._combineSubcategoryWithCategory(result, 'monster moves', movesCategory);

        return result;
    }

    _getTags(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();
        let tags = actor.data.data.tagsString.split(',').map(t => {
            let tag = t.trim();
            return {_id: encodeURIComponent(tag), name: tag};
        });

        let tagCategory = this.initializeEmptySubcategory();
        tagCategory.actions = this._produceMap(tokenId, actorType, tags, 'tag');

        this._combineSubcategoryWithCategory(result, 'tags', tagCategory);
        return result;
    }

    _getSpecialQualities(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();
        let tags = actor.data.data.attributes.specialQualities.value.split(',').map(s => {
            let quality = s.trim();
            return {_id: encodeURIComponent(quality), name: quality};
        });

        let tagCategory = this.initializeEmptySubcategory();
        tagCategory.actions = this._produceMap(tokenId, actorType, tags, 'quality');

        this._combineSubcategoryWithCategory(result, 'special qualities', tagCategory);
        return result;
    }

    _getCompendiumEntries(categoryName, compendiumName) {
        let result = this.initializeEmptyCategory();
        let pack = game.packs.get(compendiumName);
        let entriesMap = pack.index.map(e => { return {name: e.name, encodedValue: `gm.compendium.${compendiumName}.${e._id}`, id: e.id } });
        let entries = this.initializeEmptySubcategory();
        entries.actions = entriesMap();

        this._combineSubcategoryWithCategory(result, categoryName, entries);
    }

    /** @private */
    _produceMap(tokenId, actorType, itemSet, macroType) {
        return itemSet.map(i => { return { 'name': i.name, 'encodedValue': `${actorType}.${macroType}.${tokenId}.${i.data._id}`, 'id': i.data._id };});
    }
}
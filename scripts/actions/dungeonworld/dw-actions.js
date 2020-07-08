import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerDw extends ActionHandler {
    constructor (filterManager) {
        super(filterManager);
        this._addGmSystemCompendium(this.i18n('DW.Moves'), 'dungeonworld.gm-movesprincipals', false);
        this._addGmSystemCompendium(this.i18n('tokenactionhud.charts'), 'dungeonworld.charts', false);
        this._addGmSystemCompendium(this.i18n('tokenactionhud.treasure'), 'dungeonworld.rollable-tables', false);
    }

    /** @override */
    async buildActionList(token) {
        let result = this.initializeEmptyActionList();

        if (settings.get('showGmCompendiums'))
            await this._addCompendiumsToList(result);

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
            this.moves = this._getMovesNpc(actor, tokenId);

            this._combineCategoryWithList(result, this.i18n('DW.Damage'), damage);
            this._combineCategoryWithList(result, this.i18n('DW.Tags'), tags);
            this._combineCategoryWithList(result, this.i18n('DW.SpecialQualities'), specialQualities);
        } else if (actorType === 'character') {
            let damage = this._getDamage(actor, tokenId);
            let startingMoves = this._getMovesByType(actor, tokenId, this.i18n('DW.MovesStarting'));
            let advancedMoves = this._getMovesByType(actor, tokenId, this.i18n('DW.MovesAdvanced'));
            let basicMoves = this._getMovesByType(actor, tokenId, this.i18n('DW.MovesOther'));
            let spells = this._getSubcategoryByType(actor, tokenId, 'spells', this.i18n('DW.Spells'), 'spell');
            let equipment = this._getSubcategoryByType(actor, tokenId, 'equipment', this.i18n('DW.Equipment'), 'equipment');
            let abilities = this._getAbilities(actor, tokenId);
            
            this._combineCategoryWithList(result, this.i18n('DW.Damage'), damage);
            this._combineCategoryWithList(result, this.i18n('DW.MovesStarting'), startingMoves);
            this._combineCategoryWithList(result, this.i18n('DW.MovesAdvanced'), advancedMoves);
            this._combineCategoryWithList(result, this.i18n('DW.MovesOther'), basicMoves);
            this._combineCategoryWithList(result, this.i18n('DW.Spells'), spells);
            this._combineCategoryWithList(result, this.i18n('DW.Equipment'), equipment);
            this._combineCategoryWithList(result, this.i18n('tokenactionhud.abilities'), abilities);
        }

        

        return result;
    }

    _getDamage(actor, tokenId) {
        let result = this.initializeEmptyCategory('damage');
        let damageCategory = this.initializeEmptySubcategory(this.i18n('DW.Damage'));
        let encodedValue = ['damage', tokenId, 'damage'].join(this.delimiter);
        damageCategory.actions.push({name: this.i18n('DW.Damage'), encodedValue: encodedValue, id: 'damage' })

        this._combineSubcategoryWithCategory(result, 'damage', damageCategory);

        return result;
    }

    _getMovesByType(actor, tokenId, movesType) {
        let moves = actor.itemTypes.move.filter(m => m.data.data.moveType === movesType);
        let result = this.initializeEmptyCategory('moves');

        let rollCategory = this._getRollMoves(moves, tokenId);
        let bookCategory = this._getBookMoves(moves, tokenId);

        this._combineSubcategoryWithCategory(result, this.i18n('DW.Roll'), rollCategory);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.book'), bookCategory);

        return result;
    }

    _getRollMoves(moves, tokenId) {
        let rollMoves = moves.filter(m => m.data.data.rollType !== '');
        let rollActions = this._produceMap(tokenId, rollMoves, 'move');
        let rollCategory = this.initializeEmptySubcategory(this.i18n('tokenactionhud.roll'));
        rollCategory.actions = rollActions;

        return rollCategory;
    }

    _getBookMoves(moves, tokenId) {
        let bookMoves = moves.filter(m => m.data.data.rollType === '');
        let bookActions = this._produceMap(tokenId, bookMoves, 'move');
        let bookCategory = this.initializeEmptySubcategory(this.i18n('tokenactionhud.book'));
        bookCategory.actions = bookActions;

        return bookCategory;
    }

    /** @private */
    _getSubcategoryByType(actor, tokenId, categoryId, categoryName, categoryType) {
        let items = actor.itemTypes[categoryType];
        let result = this.initializeEmptyCategory(categoryId);
        let actions = this._produceMap(tokenId, items, categoryType);
        let category = this.initializeEmptySubcategory(categoryName);
        category.actions = actions;

        this._combineSubcategoryWithCategory(result, categoryName, category);

        return result;
    }

    /** @private */
    _getAbilities(actor, tokenId) {
        let result = this.initializeEmptyCategory('abilities');

        let abilities = Object.entries(actor.data.data.abilities);
        let abilitiesMap = abilities.map(a => { return { data: { _id:a[0] }, name:a[1].label } })
        let actions = this._produceMap(tokenId, abilitiesMap, 'ability');
        let abilitiesCategory = this.initializeEmptySubcategory(this.i18n('tokenactionhud.abilities'));
        abilitiesCategory.actions = actions;

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.abilities'), abilitiesCategory);

        return result;
    }

    _getMovesNpc(actor, tokenId) {
        let result = this.initializeEmptyCategory('moves');

        let biography = actor.data.data.details.biography;
            
        let instinctsCategory = this.initializeEmptySubcategory();
        let instinctRegex = new RegExp('<p(|\s+[^>]*)>(Instinct:.*?)<\/p\s*>', 'g')
        let instinctMap = Array.from(biography.matchAll(instinctRegex)).map(m => {
            let move = m[2];
            let encodedValue = encodeURIComponent(move);
        return {data: {_id: encodedValue}, name: move};
        });

        let instinctActions = this._produceMap(tokenId, instinctMap, 'instinct');
        instinctsCategory.actions = instinctActions;

        let movesCategory = this.initializeEmptySubcategory();
        var movesRegex = new RegExp('<li(|\s+[^>]*)>(.*?)<\/li\s*>', 'g');
        var movesMap = Array.from(biography.matchAll(movesRegex)).map(m => {
            let move = m[2];
            let encodedValue = encodeURIComponent(move);
        return {data: {_id: encodedValue}, name: move};
        });

        let movesActions = this._produceMap(tokenId, movesMap, 'move')
        movesCategory.actions = movesActions;
        
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.instinct'), instinctsCategory);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.monsterMoves'), movesCategory);

        return result;
    }

    _getTags(actor, tokenId) {
        let result = this.initializeEmptyCategory('tags');
        let tags = actor.data.data.tagsString.split(',').map(t => {
            let tag = t.trim();
            if (tag.length === 0)
                return;

            let encodedValue = encodeURIComponent(tag);
            return { data: {_id: encodedValue}, name: tag};
        });

        let tagCategory = this.initializeEmptySubcategory();
        tagCategory.actions = this._produceMap(tokenId, tags, 'tag');

        this._combineSubcategoryWithCategory(result, this.i18n('DW.Tags'), tagCategory);
        return result;
    }

    _getSpecialQualities(actor, tokenId) {
        let result = this.initializeEmptyCategory('qualities');
        let qualities = actor.data.data.attributes.specialQualities.value.split(',').map(s => {
            let quality = s.trim();
            if (quality.length === 0)
                return;

            let encodedValue = encodeURIComponent(quality);
            return { data: {_id: encodedValue}, name: quality};
        });

        let qualityCategory = this.initializeEmptySubcategory();
        qualityCategory.actions = this._produceMap(tokenId, qualities, 'quality');

        this._combineSubcategoryWithCategory(result, this.i18n('DW.SpecialQualities'), qualityCategory);
        return result;
    }

    /** @private */
    _produceMap(tokenId, itemSet, macroType) {
        return itemSet.filter(i => !!i).map(i => {
            let encodedValue = [macroType, tokenId, i.data._id].join(this.delimiter);
            return { name: i.name, encodedValue: encodedValue, id: i.data._id };
        });
    }
}
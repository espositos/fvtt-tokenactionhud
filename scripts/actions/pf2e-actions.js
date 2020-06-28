import {ActionHandler} from './actionHandler.js';

export class ActionHandlerPf2e extends ActionHandler {
    constructor(rollHandlerPf2e) {
        super();
        this.rollHandler = rollHandlerPf2e;
    }    

    /** @override */
    buildActionList(token) {
        let result = this.initializeEmptyActionList();

        if (!token) {
            return result;
        }

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor) {
            return result;
        }
        
        result.actorId = actor._id;

        let strikes = this._getStrikesList(actor, tokenId); // ??? profit
        let actions = this._getActionsList(actor, tokenId); // actions, reactions, free actions
        let items = this._getItemsList(actor, tokenId); // weapons, consumables, other?
        let spells = this._getSpellsList(actor, tokenId);
        let feats = this._getFeatsList(actor, tokenId); // active and passive
        let skills = this._getSkillsList(actor, tokenId); // skills and lore
        let abilities = this._getAbilityList(actor, tokenId);
        let saves = this._getSaveList(actor, tokenId);

        this._combineCategoryWithList(result, 'strikes', strikes);
        this._combineCategoryWithList(result, 'actions', actions);
        this._combineCategoryWithList(result, 'items', items);
        this._combineCategoryWithList(result, 'spells', spells);
        this._combineCategoryWithList(result, 'feats', feats);
        this._combineCategoryWithList(result, 'skills', skills);
        this._combineCategoryWithList(result, 'abilities', abilities);
        this._combineCategoryWithList(result, 'saves', saves);

        return result;
    }

    _getStrikesList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let strikes = actor.data.data.actions.filter(a => a.type === 'strike');

        strikes.forEach(s => {
            let subcategory = this.initializeEmptySubcategory();

            let variantsMap = s.variants.map(function (v) {
                let name = v.label.lastIndexOf('+') >= 0 ? v.label.slice(v.label.lastIndexOf('+')-1) : v.label.slice(v.label.lastIndexOf('-')-1);
                return {_id: encodeURIComponent(this.name+`>${this.variants.indexOf(v)}`), name: name } 
            }.bind(s));
            subcategory.actions = this._produceMap(tokenId, variantsMap, 'strike');
            
            subcategory.actions.push({name: 'Damage', encodedValue: `strike.${tokenId}.${encodeURIComponent(s.name+'>damage')}`, id: encodeURIComponent(s.name+'>damage')})
            subcategory.actions.push({name: 'Critical', encodedValue: `strike.${tokenId}.${encodeURIComponent(s.name+'>critical')}`, id: encodeURIComponent(s.name+'>critical')})

            this._combineSubcategoryWithCategory(result, s.name, subcategory);
        });

        return result;
    }

    _getActionsList(actor, tokenId, type) {
        let result = this.initializeEmptyCategory();

        let filteredActions = (actor.data.data.actions ?? []).filter(a => a.type === 'action');

        let actions = this.initializeEmptySubcategory();
        actions.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.actionType === 'action'), 'action');

        let reactions = this.initializeEmptySubcategory();
        reactions.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.actionType === 'reaction'), 'action');

        let free = this.initializeEmptySubcategory();
        free.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.actionType === 'free'), 'action');

        this._combineSubcategoryWithCategory(result, 'actions', actions);
        this._combineSubcategoryWithCategory(result, 'reactions', reactions);
        this._combineSubcategoryWithCategory(result, 'free actions', free);

        return result;
    }

    _getItemsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let filter = ['weapon', 'equipment', 'consumable'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let weapons = this.initializeEmptySubcategory();
        weapons.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.type === 'weapon'), 'item');

        let equipment = this.initializeEmptySubcategory();
        equipment.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.type === 'equipment'), 'item');

        let consumables = this.initializeEmptySubcategory();
        consumables.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.type === 'consumable'), 'item');

        this._combineSubcategoryWithCategory(result, 'weapons', weapons);
        this._combineSubcategoryWithCategory(result, 'equipment', equipment);
        this._combineSubcategoryWithCategory(result, 'consumables', consumables);

        return result;
    }

    _getSpellsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let filter = ['spell'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let spells = this.initializeEmptySubcategory();
        spells.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.type === 'spell'), 'item');

        this._combineSubcategoryWithCategory(result, 'spells', spells);

        return result;
    }

    _getFeatsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let filter = ['feat'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let active = this.initializeEmptySubcategory();
        active.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value !== 'passive'), 'item');

        let passive = this.initializeEmptySubcategory();
        passive.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value === 'passive'), 'item');

        this._combineSubcategoryWithCategory(result, 'active', active);
        this._combineSubcategoryWithCategory(result, 'passive', passive);

        return result;
    }

    _getSkillsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorSkills = actor.data.data.skills;
        let skillMap = Object.keys(actorSkills).map(k => { return {'_id': k, 'name': actorSkills[k].name.charAt(0).toUpperCase()+actorSkills[k].name.slice(1)}});
        let skills = this.initializeEmptySubcategory();
        skills.actions = this._produceMap(tokenId, skillMap, 'skill');

        let loreItems = actor.items.filter(i => i.data.type === 'lore');
        let lore = this.initializeEmptySubcategory();
        lore.actions = this._produceMap(tokenId, loreItems, 'lore');

        this._combineSubcategoryWithCategory(result, 'skills', skills);
        this._combineSubcategoryWithCategory(result, 'lore', lore);

        return result;
    }

    _getAbilityList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorAbilities = actor.data.data.abilities;
        let abilityMap = Object.keys(actorAbilities).map(k => { return {'_id': k, 'name': k.charAt(0).toUpperCase()+k.slice(1)}});

        let abilities = this.initializeEmptySubcategory();
        abilities.actions = this._produceMap(tokenId, abilityMap, 'ability');

        this._combineSubcategoryWithCategory(result, 'abilities', abilities);

        return result;
    }

    _getSaveList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {'_id': k, 'name': actorSaves[k].name.charAt(0).toUpperCase()+actorSaves[k].name.slice(1)}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceMap(tokenId, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, 'saves', saves);

        return result;
    }

    _produceMap(tokenId, itemSet, type) {
        return itemSet.map(i => { return { 'name': i.name, 'encodedValue': `${type}.${tokenId}.${i._id}`, 'id': i._id };});
    } 
}